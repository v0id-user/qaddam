'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Upload, FileText, X, AlertCircle, Brain, Target, Settings } from 'lucide-react';
import WorkflowSteps from '@/components/dashboard/WorkflowSteps';
import JobResults from '@/components/dashboard/JobResults';
import type { DashboardStage } from '@/components/dashboard/types';

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const [currentStage, setCurrentStage] = useState<DashboardStage>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { getRootProps, getInputProps, isDragActive, isDragAccept } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
    onDrop: acceptedFiles => {
      setUploadError(null);
      if (acceptedFiles.length > 0) {
        setSelectedFile(acceptedFiles[0]);
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

  const handleDeleteFile = () => {
    setSelectedFile(null);
    setUploadError(null);
  };

  const handleScanCV = () => {
    if (selectedFile) {
      console.log('Starting CV scan with:', selectedFile.name);
      setCurrentStage('workflow');
    }
  };

  const handleWorkflowComplete = () => {
    console.log('Workflow completed, showing results');
    setCurrentStage('results');
  };

  const handleBackToUpload = () => {
    setCurrentStage('upload');
    setSelectedFile(null);
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
            {t('cv_upload.title')}
          </h1>
          <p className="text-muted-foreground text-xl leading-relaxed">{t('cv_upload.subtitle')}</p>
        </div>

        {/* Main Upload Section */}
        <div className="mb-16">
          <div className="bg-card ring-accent/50 hover:ring-accent/70 rounded-3xl p-10 shadow-lg ring-1 transition-all duration-300 hover:shadow-xl">
            <div className="text-center">
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
                }`}
              >
                <input {...getInputProps()} />

                <div className="flex flex-col items-center space-y-6">
                  {selectedFile ? (
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

              {/* Scan Button */}
              <Button
                onClick={handleScanCV}
                disabled={!selectedFile}
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl border-none px-12 py-6 text-xl font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
              >
                {t('cv_upload.scan_button')}
              </Button>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
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
      </div>
    </div>
  );
}
