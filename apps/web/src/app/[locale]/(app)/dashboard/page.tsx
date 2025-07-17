'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAction, useMutation, useQuery } from 'convex/react';
import { Button } from '@/components/ui/button';
import { Upload, FileText, X, Brain, Target, Settings, Eye, Trash2, Search } from 'lucide-react';
import WorkflowSteps from '@/components/dashboard/WorkflowSteps';
import JobResults from '@/components/dashboard/JobResults';
import type { DashboardStage } from '@/components/dashboard/types';
import { api } from '@qaddam/backend/convex/_generated/api';
import type { Id } from '@qaddam/backend/convex/_generated/dataModel';
import { toast } from 'react-hot-toast';
import type { WorkflowId } from '@qaddam/backend/convex/jobs/workflow';
import { useQueryState } from 'nuqs';
import { useRouter } from 'next/navigation';
import { useLogger } from '@/lib/axiom/client';

export default function DashboardPage() {
  const logger = useLogger();
  const router = useRouter();
  const t = useTranslations('dashboard');
  const [currentStage, setCurrentStage] = useState<DashboardStage>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedCVId, setUploadedCVId] = useState<Id<'_storage'> | null>(null);
  const [cvData, setCvData] = useState<{
    cvId: string;
    storageId: string;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [workflowId, setWorkflowId] = useState<WorkflowId | null>(null);
  const [workflowTrackingId, setWorkflowTrackingId] = useState<string | null>(null);
  const generateUploadUrl = useMutation(api.upload.generateUploadUrl);
  const saveCV = useMutation(api.upload.saveCV);
  const getCVDownloadUrl = useMutation(api.upload.getCVDownloadUrl);
  const deleteCV = useMutation(api.upload.deleteCV);
  const me = useQuery(api.users.getMe);
  const [plan] = useQueryState('p');

  useEffect(() => {
    if (plan === 'pro') {
      router.push('/dashboard/upgrade');
    }
  }, [plan, router]);

  // Workflow functions
  const startWorkflow = useAction(api.jobs.workflow.startJobSearchWorkflow);

  const { getRootProps, getInputProps, isDragActive, isDragAccept } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
    onDrop: async acceptedFiles => {
      if (!me) return;
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setSelectedFile(file);
        await handleUploadCV(file);
      }
    },
    onDropRejected: fileRejections => {
      if (!me) return;

      setSelectedFile(null);
      const rejection = fileRejections[0];
      if (rejection) {
        const errors = rejection.errors.map(error => {
          switch (error.code) {
            case 'file-invalid-type':
              return t('cv_upload.errors.invalid_type');
            case 'file-too-large':
              return t('cv_upload.errors.file_too_large');
            case 'too-many-files':
              return t('cv_upload.errors.too_many_files');
            default:
              return error.message;
          }
        });
        toast.error(errors.join(', '));
      }
    },
  });

  const handleUploadCV = async (file: File) => {
    if (!me) return;

    setIsUploading(true);

    try {
      // Generate upload URL
      const uploadUrl = await generateUploadUrl();

      // Upload file to Convex storage
      const result = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      const { storageId } = await result.json();

      // Save CV with validation
      const cvResult = await saveCV({
        storageId: storageId as Id<'_storage'>,
      });

      setUploadedCVId(storageId);
      setCvData(cvResult);
      setCurrentStage('uploaded');
      toast.success(t('cv_upload.success.cv_uploaded'));
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : t('cv_upload.errors.upload_failed'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async () => {
    if (!cvData?.cvId) {
      // If no CV to delete, just clear local state
      setSelectedFile(null);
      setUploadedCVId(null);
      setCvData(null);
      setCurrentStage('upload');
      return;
    }

    try {
      // Delete CV from backend (this will delete both the file and database record)
      await deleteCV({ cvId: cvData.cvId as Id<'cvUploads'> });

      // Clear local state after successful deletion
      setSelectedFile(null);
      setUploadedCVId(null);
      setCvData(null);
      setCurrentStage('upload');
      toast.success(t('cv_upload.success.cv_deleted'));
    } catch (error) {
      console.error('Error deleting CV:', error);
      toast.error(error instanceof Error ? error.message : t('cv_upload.errors.delete_failed'));
    }
  };

  const handleViewCV = async () => {
    if (cvData?.cvId) {
      try {
        // Get secure download URL
        const cvUrl = await getCVDownloadUrl({ cvId: cvData.cvId as Id<'cvUploads'> });
        if (cvUrl) {
          window.open(cvUrl, '_blank');
        }
      } catch (error) {
        console.error('Error getting CV download URL:', error);
        toast.error(t('cv_upload.errors.view_failed'));
      }
    }
  };

  const handleStartJobSearch = async () => {
    if (!uploadedCVId || !me) {
      toast.error(t('job_results.errors.cv_not_found'));
      return;
    }

    try {
      logger.info('Starting job search workflow with CV:', uploadedCVId);
      toast.success(t('job_results.messages.workflow_starting'));

      const result = await startWorkflow({
        cv_storage_id: uploadedCVId,
      });

      setWorkflowId(result.workflowId);
      setWorkflowTrackingId(result.workflowTrackingId);
      setCurrentStage('workflow');

      logger.info('Workflow started successfully:', result);
    } catch (error) {
      logger.error('Error starting workflow:', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      toast.error(t('job_results.errors.workflow_start_failed'));
    }
  };

  const handleWorkflowComplete = () => {
    logger.info('Workflow completed with results');
    setCurrentStage('results');
    toast.success(t('job_results.messages.workflow_completed'));
  };

  const handleBackToUpload = () => {
    setCurrentStage('upload');
    setSelectedFile(null);
    setUploadedCVId(null);
    setCvData(null);
    setWorkflowId(null);
  };

  // Render based on current stage
  if (currentStage === 'workflow') {
    return (
      <WorkflowSteps
        workflowId={workflowId!}
        workflowTrackingId={workflowTrackingId!}
        onComplete={handleWorkflowComplete}
      />
    );
  }

  if (currentStage === 'results') {
    return <JobResults workflowId={workflowId!} onBackToUpload={handleBackToUpload} />;
  }

  return (
    <div className="min-h-screen px-6 py-16">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="text-foreground mb-4 text-3xl font-bold md:text-4xl lg:text-5xl">
            {currentStage === 'uploaded' ? t('cv_upload.cv_uploaded') : t('cv_upload.title')}
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            {currentStage === 'uploaded'
              ? t('cv_upload.cv_uploaded_subtitle')
              : t('cv_upload.subtitle')}
          </p>
        </div>

        {/* Main Upload/CV Management Section */}
        <div className="mb-12">
          <div className="bg-card ring-accent/30 hover:ring-accent/50 rounded-2xl p-8 shadow-lg ring-1 transition-all duration-300 hover:shadow-xl">
            <div className="text-center">
              {currentStage === 'uploaded' && selectedFile ? (
                /* CV Uploaded State */
                <div className="space-y-6">
                  {/* Uploaded File Display */}
                  <div className="bg-card ring-primary/40 mx-auto flex w-full max-w-md items-center space-x-4 space-x-reverse rounded-xl p-6 shadow-lg ring-1">
                    <div className="bg-primary/8 rounded-full p-3">
                      <FileText className="text-primary h-8 w-8" />
                    </div>
                    <div className="flex-1 text-right">
                      <p className="text-foreground mb-1 truncate text-lg font-semibold">
                        {selectedFile.name}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <Button
                      onClick={handleViewCV}
                      variant="outline"
                      size="lg"
                      className="rounded-xl px-6 py-4 text-base font-medium shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      {t('cv_upload.view_cv')}
                    </Button>

                    <Button
                      onClick={handleDeleteFile}
                      variant="outline"
                      size="lg"
                      className="border-destructive/20 text-destructive hover:bg-destructive/10 rounded-xl px-6 py-4 text-base font-medium shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t('cv_upload.delete_cv')}
                    </Button>

                    <Button
                      onClick={handleStartJobSearch}
                      size="lg"
                      className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-10 py-4 text-lg font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                    >
                      <Search className="mr-2 h-5 w-5" />
                      {t('cv_upload.start_job_search')}
                    </Button>
                  </div>
                </div>
              ) : (
                /* Upload State */
                <>
                  {/* File Input Area */}
                  <div
                    {...getRootProps()}
                    className={`relative mb-6 cursor-pointer rounded-xl border-2 border-dashed p-10 transition-all duration-300 ${
                      isDragActive
                        ? isDragAccept
                          ? 'border-primary bg-primary/8 shadow-lg'
                          : 'border-destructive bg-destructive/8 shadow-lg'
                        : selectedFile
                          ? 'border-primary/50 bg-primary/3'
                          : 'border-border bg-accent/10 hover:border-primary/30 hover:bg-accent/20'
                    } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
                  >
                    <input {...getInputProps()} disabled={isUploading} />

                    <div className="flex flex-col items-center space-y-4">
                      {isUploading ? (
                        <div className="space-y-3">
                          <div className="bg-accent/50 rounded-full p-4">
                            <div className="border-primary h-10 w-10 animate-spin rounded-full border-t-2 border-b-2"></div>
                          </div>
                          <div className="space-y-2">
                            <p className="text-foreground text-lg font-medium">
                              {t('cv_upload.uploading.title')}
                            </p>
                            <p className="text-muted-foreground text-sm">
                              {t('cv_upload.uploading.subtitle')}
                            </p>
                          </div>
                        </div>
                      ) : selectedFile ? (
                        <div className="bg-card ring-accent/30 flex w-full max-w-md items-center space-x-4 space-x-reverse rounded-xl p-6 shadow-lg ring-1">
                          <div className="bg-accent/50 rounded-full p-3">
                            <FileText className="text-primary h-8 w-8" />
                          </div>
                          <div className="flex-1 text-right">
                            <p className="text-foreground mb-1 truncate text-lg font-semibold">
                              {selectedFile.name}
                            </p>
                            <p className="text-muted-foreground text-sm">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleDeleteFile();
                            }}
                            className="bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-full p-2 transition-colors"
                            title={t('cv_upload.delete_file')}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="bg-accent/50 rounded-full p-4">
                            <Upload className="text-primary h-10 w-10" />
                          </div>
                          <div className="space-y-2">
                            <p className="text-foreground text-lg font-medium">
                              {t('cv_upload.file_input_placeholder')}
                            </p>
                            <p className="text-muted-foreground text-sm">
                              {t('cv_upload.file_requirements')}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Benefits Section - Only show in upload state */}
        {currentStage === 'upload' && (
          <div className="grid gap-4 md:grid-cols-3">
            {/* Smart Analysis */}
            <div className="bg-card/50 border-accent/10 rounded-xl border p-5 shadow-sm backdrop-blur-sm transition-all duration-200 hover:shadow-md">
              <div className="flex flex-col items-center space-y-3 text-center">
                <div className="bg-accent/50 rounded-full p-3">
                  <Brain className="text-primary h-5 w-5" />
                </div>
                <h4 className="text-foreground text-lg font-semibold">
                  {t('cv_upload.benefits.smart_analysis.title')}
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t('cv_upload.benefits.smart_analysis.subtitle')}
                </p>
              </div>
            </div>

            {/* Tailored Matches */}
            <div className="bg-card/50 border-accent/10 rounded-xl border p-5 shadow-sm backdrop-blur-sm transition-all duration-200 hover:shadow-md">
              <div className="flex flex-col items-center space-y-3 text-center">
                <div className="bg-accent/50 rounded-full p-3">
                  <Target className="text-primary h-5 w-5" />
                </div>
                <h4 className="text-foreground text-lg font-semibold">
                  {t('cv_upload.benefits.tailored_matches.title')}
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t('cv_upload.benefits.tailored_matches.subtitle')}
                </p>
              </div>
            </div>

            {/* Full Control */}
            <div className="bg-card/50 border-accent/10 rounded-xl border p-5 shadow-sm backdrop-blur-sm transition-all duration-200 hover:shadow-md">
              <div className="flex flex-col items-center space-y-3 text-center">
                <div className="bg-accent/50 rounded-full p-3">
                  <Settings className="text-primary h-5 w-5" />
                </div>
                <h4 className="text-foreground text-lg font-semibold">
                  {t('cv_upload.benefits.full_control.title')}
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t('cv_upload.benefits.full_control.subtitle')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
