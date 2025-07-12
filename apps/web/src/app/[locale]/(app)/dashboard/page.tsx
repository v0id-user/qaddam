'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
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

export default function DashboardPage() {
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

  const generateUploadUrl = useMutation(api.upload.generateUploadUrl);
  const saveCV = useMutation(api.upload.saveCV);
  const getCVDownloadUrl = useMutation(api.upload.getCVDownloadUrl);
  const deleteCV = useMutation(api.upload.deleteCV);
  const me = useQuery(api.users.getMe);

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
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setSelectedFile(file);
        await handleUploadCV(file);
      }
    },
    onDropRejected: fileRejections => {
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
      toast.error('CV or user not found');
      return;
    }

    try {
      console.log('Starting job search workflow with CV:', uploadedCVId);
      toast.success('🚀 Starting job search workflow...');

      const result = (await startWorkflow({
        cv_storage_id: uploadedCVId,
        userId: me._id,
      })) as WorkflowId;

      setWorkflowId(result);
      setCurrentStage('workflow');

      console.log('Workflow started successfully:', result);
    } catch (error) {
      console.error('Error starting workflow:', error);
      toast.error('Failed to start job search workflow');
    }
  };

  const handleWorkflowComplete = () => {
    console.log('Workflow completed with results');
    setCurrentStage('results');
    toast.success('🎉 Job search completed!');
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
    return <WorkflowSteps workflowId={workflowId!} onComplete={handleWorkflowComplete} />;
  }

  if (currentStage === 'results') {
    return <JobResults workflowId={workflowId!} onBackToUpload={handleBackToUpload} />;
  }

  return (
    <div className="min-h-screen px-6 py-24">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-20 text-center">
          <h1 className="text-foreground mb-6 text-4xl font-bold md:text-5xl lg:text-6xl">
            {currentStage === 'uploaded' ? t('cv_upload.cv_uploaded') : t('cv_upload.title')}
          </h1>
          <p className="text-muted-foreground text-xl leading-relaxed">
            {currentStage === 'uploaded'
              ? t('cv_upload.cv_uploaded_subtitle')
              : t('cv_upload.subtitle')}
          </p>
        </div>

        {/* Main Upload/CV Management Section */}
        <div className="mb-16">
          <div className="bg-card ring-accent/50 hover:ring-accent/70 rounded-3xl p-10 shadow-lg ring-1 transition-all duration-300 hover:shadow-xl">
            <div className="text-center">
              {currentStage === 'uploaded' && selectedFile ? (
                /* CV Uploaded State */
                <div className="space-y-8">
                  {/* Uploaded File Display */}
                  <div className="bg-card ring-primary/60 mx-auto flex w-full max-w-md items-center space-x-6 space-x-reverse rounded-2xl p-8 shadow-lg ring-1">
                    <div className="bg-primary/10 rounded-full p-4">
                      <FileText className="text-primary h-10 w-10" />
                    </div>
                    <div className="flex-1 text-right">
                      <p className="text-foreground mb-1 truncate text-xl font-bold">
                        {selectedFile.name}
                      </p>
                      <p className="text-muted-foreground text-base">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <Button
                      onClick={handleViewCV}
                      variant="outline"
                      size="lg"
                      className="rounded-2xl px-8 py-6 text-lg font-semibold shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    >
                      <Eye className="mr-2 h-5 w-5" />
                      {t('cv_upload.view_cv')}
                    </Button>

                    <Button
                      onClick={handleDeleteFile}
                      variant="outline"
                      size="lg"
                      className="border-destructive/20 text-destructive hover:bg-destructive/10 rounded-2xl px-8 py-6 text-lg font-semibold shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    >
                      <Trash2 className="mr-2 h-5 w-5" />
                      {t('cv_upload.delete_cv')}
                    </Button>

                    <Button
                      onClick={handleStartJobSearch}
                      size="lg"
                      className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl px-12 py-6 text-xl font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                    >
                      <Search className="mr-2 h-6 w-6" />
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
                    className={`relative mb-8 cursor-pointer rounded-2xl border-2 border-dashed p-12 transition-all duration-300 ${
                      isDragActive
                        ? isDragAccept
                          ? 'border-primary bg-primary/10 shadow-lg'
                          : 'border-destructive bg-destructive/10 shadow-lg'
                        : selectedFile
                          ? 'border-primary/60 bg-primary/5'
                          : 'border-border bg-accent/20 hover:border-primary/40 hover:bg-accent/30'
                    } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
                  >
                    <input {...getInputProps()} disabled={isUploading} />

                    <div className="flex flex-col items-center space-y-6">
                      {isUploading ? (
                        <div className="space-y-4">
                          <div className="bg-accent rounded-full p-6">
                            <div className="border-primary h-14 w-14 animate-spin rounded-full border-t-2 border-b-2"></div>
                          </div>
                          <div className="space-y-2">
                            <p className="text-foreground text-xl font-semibold">
                              {t('cv_upload.uploading.title')}
                            </p>
                            <p className="text-muted-foreground text-base">
                              {t('cv_upload.uploading.subtitle')}
                            </p>
                          </div>
                        </div>
                      ) : selectedFile ? (
                        <div className="bg-card ring-accent/40 flex w-full max-w-md items-center space-x-6 space-x-reverse rounded-2xl p-8 shadow-lg ring-1">
                          <div className="bg-accent rounded-full p-4">
                            <FileText className="text-primary h-10 w-10" />
                          </div>
                          <div className="flex-1 text-right">
                            <p className="text-foreground mb-1 truncate text-xl font-bold">
                              {selectedFile.name}
                            </p>
                            <p className="text-muted-foreground text-base">
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
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="bg-accent rounded-full p-6">
                            <Upload className="text-primary h-14 w-14" />
                          </div>
                          <div className="space-y-2">
                            <p className="text-foreground text-xl font-semibold">
                              {t('cv_upload.file_input_placeholder')}
                            </p>
                            <p className="text-muted-foreground text-base">
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
          <div className="grid gap-6 md:grid-cols-3">
            {/* Smart Analysis */}
            <div className="bg-card/70 border-accent/20 rounded-2xl border p-6 shadow-sm backdrop-blur-sm transition-all duration-200 hover:shadow-md">
              <div className="flex flex-col items-center space-y-3 text-center">
                <div className="bg-accent/80 rounded-full p-3">
                  <Brain className="text-primary h-6 w-6" />
                </div>
                <h4 className="text-foreground text-lg font-bold">
                  {t('cv_upload.benefits.smart_analysis.title')}
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t('cv_upload.benefits.smart_analysis.subtitle')}
                </p>
              </div>
            </div>

            {/* Tailored Matches */}
            <div className="bg-card/70 border-accent/20 rounded-2xl border p-6 shadow-sm backdrop-blur-sm transition-all duration-200 hover:shadow-md">
              <div className="flex flex-col items-center space-y-3 text-center">
                <div className="bg-accent/80 rounded-full p-3">
                  <Target className="text-primary h-6 w-6" />
                </div>
                <h4 className="text-foreground text-lg font-bold">
                  {t('cv_upload.benefits.tailored_matches.title')}
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t('cv_upload.benefits.tailored_matches.subtitle')}
                </p>
              </div>
            </div>

            {/* Full Control */}
            <div className="bg-card/70 border-accent/20 rounded-2xl border p-6 shadow-sm backdrop-blur-sm transition-all duration-200 hover:shadow-md">
              <div className="flex flex-col items-center space-y-3 text-center">
                <div className="bg-accent/80 rounded-full p-3">
                  <Settings className="text-primary h-6 w-6" />
                </div>
                <h4 className="text-foreground text-lg font-bold">
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
