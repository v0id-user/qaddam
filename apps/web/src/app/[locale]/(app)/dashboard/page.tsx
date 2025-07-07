'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQuery } from 'convex/react';
import { Button } from '@/components/ui/button';
import { Upload, FileText, X, AlertCircle, Brain, Target, Settings, Eye, Trash2, Search } from 'lucide-react';
import WorkflowSteps from '@/components/dashboard/WorkflowSteps';
import JobResults from '@/components/dashboard/JobResults';
import type { DashboardStage } from '@/components/dashboard/types';
import { api } from '@qaddam/backend/convex/_generated/api';
import type { Id } from '@qaddam/backend/convex/_generated/dataModel';

type UploadStage = 'upload' | 'uploaded' | 'workflow' | 'results';

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const [currentStage, setCurrentStage] = useState<UploadStage>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedCVId, setUploadedCVId] = useState<Id<"_storage"> | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const generateUploadUrl = useMutation(api.upload.generateUploadUrl);
  const saveCV = useMutation(api.upload.saveCV);
  const me = useQuery(api.users.getMe);

  const { getRootProps, getInputProps, isDragActive, isDragAccept } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
    onDrop: async (acceptedFiles) => {
      setUploadError(null);
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
        setUploadError(errors.join(', '));
      }
    },
  });

  const handleUploadCV = async (file: File) => {
    if (!me) return;
    
    setIsUploading(true);
    setUploadError(null);

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
      await saveCV({ 
        storageId: storageId as Id<"_storage">, 
        userId: me._id 
      });
      
      setUploadedCVId(storageId);
      setCurrentStage('uploaded');
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : t('cv_upload.errors.upload_failed'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = () => {
    setSelectedFile(null);
    setUploadedCVId(null);
    setUploadError(null);
    setCurrentStage('upload');
  };

  const handleViewCV = () => {
    if (uploadedCVId) {
      // Open CV in new tab
      const cvUrl = `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${uploadedCVId}`;
      window.open(cvUrl, '_blank');
    }
  };

  const handleStartJobSearch = () => {
    console.log('Starting job search workflow with CV:', uploadedCVId);
    setCurrentStage('workflow');
  };

  const handleWorkflowComplete = () => {
    console.log('Workflow completed, showing results');
    setCurrentStage('results');
  };

  const handleBackToUpload = () => {
    setCurrentStage('upload');
    setSelectedFile(null);
    setUploadedCVId(null);
    setUploadError(null);
  };

  // Render based on current stage
  if (currentStage === 'workflow') {
    return <WorkflowSteps onComplete={handleWorkflowComplete} />;
  }

  if (currentStage === 'results') {
    return <JobResults onBackToUpload={handleBackToUpload} />;
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
            {currentStage === 'uploaded' ? t('cv_upload.cv_uploaded_subtitle') : t('cv_upload.subtitle')}
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
                  <div className="bg-card ring-primary/60 flex w-full max-w-md mx-auto items-center space-x-6 space-x-reverse rounded-2xl p-8 shadow-lg ring-1">
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
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
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
                      className="rounded-2xl px-8 py-6 text-lg font-semibold shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg border-destructive/20 text-destructive hover:bg-destructive/10"
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
                            <div className="h-14 w-14 animate-spin rounded-full border-t-2 border-b-2 border-primary"></div>
                          </div>
                          <div className="space-y-2">
                            <p className="text-foreground text-xl font-semibold">
                              Uploading CV...
                            </p>
                            <p className="text-muted-foreground text-base">
                              Please wait while we upload your resume
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

                  {/* Error Message */}
                  {uploadError && (
                    <div className="bg-destructive/10 border-destructive/20 mb-6 rounded-xl border p-4">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <AlertCircle className="text-destructive h-5 w-5 flex-shrink-0" />
                        <p className="text-destructive font-medium">{uploadError}</p>
                      </div>
                    </div>
                  )}
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
