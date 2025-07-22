'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { FileText, Calendar, Eye, Trash2, BarChart3, Clock, CheckCircle, XCircle, Plus } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@qaddam/backend/convex/_generated/api';
import type { Id } from '@qaddam/backend/convex/_generated/dataModel';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

interface UploadsHistoryProps {
  onViewResults?: (workflowId: string) => void;
}

const UploadsHistory = ({ onViewResults }: UploadsHistoryProps) => {
  const t = useTranslations('dashboard');
  
  // Queries
  const cvUploads = useQuery(api.user_data.getUserCVUploads);
  const jobSearchResults = useQuery(api.user_data.getUserJobSearchResultsWithStats);
  const getCVDownloadUrl = useMutation(api.upload.getCVDownloadUrl);
  const deleteCV = useMutation(api.upload.deleteCV);

  // Create a map of CV uploads to their job search results
  const uploadsWithResults = cvUploads?.map(cv => {
    const relatedResults = jobSearchResults?.filter(result => result.cvStorageId === cv.storageId) || [];
    return {
      ...cv,
      searchResults: relatedResults,
      hasResults: relatedResults.length > 0,
      totalJobsFound: relatedResults.reduce((sum, result) => sum + result.totalFound, 0),
      latestSearchDate: relatedResults.length > 0 ? Math.max(...relatedResults.map(r => r.createdAt)) : null,
    };
  }) || [];

  const handleViewCV = async (cvId: string) => {
    try {
      const cvUrl = await getCVDownloadUrl({ cvId: cvId as Id<'cvUploads'> });
      if (cvUrl) {
        window.open(cvUrl, '_blank');
      }
    } catch (error) {
      console.error('Error getting CV download URL:', error);
      toast.error(t('cv_upload.errors.view_failed'));
    }
  };

  const handleDeleteCV = async (cvId: string, fileName: string) => {
    if (!confirm(t('uploads_history.delete_confirm', { fileName }))) {
      return;
    }
    
    try {
      await deleteCV({ cvId: cvId as Id<'cvUploads'> });
      toast.success(t('cv_upload.success.cv_deleted'));
    } catch (error) {
      console.error('Error deleting CV:', error);
      toast.error(error instanceof Error ? error.message : t('cv_upload.errors.delete_failed'));
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return t('uploads_history.date_format.yesterday');
    if (diffDays < 7) return t('uploads_history.date_format.days_ago', { days: diffDays });
    if (diffDays < 30) return t('uploads_history.date_format.weeks_ago', { weeks: Math.floor(diffDays / 7) });
    return date.toLocaleDateString();
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-50 text-green-700 border-green-200' 
      : 'bg-gray-50 text-gray-500 border-gray-200';
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />;
  };

  if (cvUploads === undefined) {
    return (
      <div className="min-h-screen px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <div className="bg-accent/50 mx-auto rounded-full p-4 w-16 h-16 flex items-center justify-center">
              <div className="border-primary h-8 w-8 animate-spin rounded-full border-t-2 border-b-2"></div>
            </div>
            <p className="text-foreground text-lg font-medium mt-4">{t('uploads_history.loading.title')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-16">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-foreground mb-4 text-3xl font-bold md:text-4xl">
            {t('uploads_history.title')}
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            {t('uploads_history.subtitle')}
          </p>
        </div>

        {/* Upload New Button */}
        <div className="mb-12 text-center">
          <Link href="/dashboard">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 text-lg">
              <Plus className="mr-2 h-5 w-5" />
              {t('uploads_history.upload_new_button')}
            </Button>
          </Link>
        </div>

        {/* Uploads List */}
        {uploadsWithResults.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="bg-accent/30 mx-auto rounded-full p-6 w-24 h-24 flex items-center justify-center mb-6">
              <FileText className="text-muted-foreground h-12 w-12" />
            </div>
            <h3 className="text-foreground text-xl font-semibold mb-2">
              {t('uploads_history.empty_state.title')}
            </h3>
            <p className="text-muted-foreground text-lg mb-6">
              {t('uploads_history.empty_state.description')}
            </p>
            <Link href="/dashboard">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                {t('uploads_history.empty_state.cta')}
              </Button>
            </Link>
          </div>
        ) : (
          /* Uploads Grid */
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {uploadsWithResults.map((upload) => (
              <div
                key={upload._id}
                className="border-border bg-card rounded-xl border p-6 shadow-sm transition-all duration-200 hover:shadow-md"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-accent/50 rounded-full p-2">
                      <FileText className="text-primary h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-foreground text-lg font-semibold truncate max-w-36">
                        {upload.originalFileName}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {formatFileSize(upload.fileSize)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium border ${getStatusColor(upload.isActive)}`}>
                    {getStatusIcon(upload.isActive)}
                    {upload.isActive ? t('uploads_history.status.active') : t('uploads_history.status.inactive')}
                  </span>
                </div>

                {/* Upload Details */}
                <div className="space-y-3 mb-5">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{t('uploads_history.uploaded')}: {formatDate(upload.uploadedAt)}</span>
                  </div>
                  
                  {upload.hasResults && (
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <BarChart3 className="h-4 w-4" />
                      <span>{t('uploads_history.jobs_found')}: {upload.totalJobsFound}</span>
                    </div>
                  )}
                  
                  {upload.latestSearchDate && (
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{t('uploads_history.last_search')}: {formatDate(upload.latestSearchDate)}</span>
                    </div>
                  )}
                </div>

                {/* Search Results Summary */}
                {upload.searchResults.length > 0 && (
                  <div className="mb-5">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <BarChart3 className="h-4 w-4 text-blue-600" />
                        <span className="text-blue-900 text-sm font-medium">
                          {t('uploads_history.search_summary.title')}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {upload.searchResults.slice(0, 2).map((result, index) => (
                          <div key={result._id} className="text-xs text-blue-700">
                            {t('uploads_history.search_summary.item', { 
                              date: formatDate(result.createdAt),
                              count: result.totalFound,
                              relevant: result.totalRelevant 
                            })}
                          </div>
                        ))}
                        {upload.searchResults.length > 2 && (
                          <div className="text-xs text-blue-600">
                            {t('uploads_history.search_summary.more', { count: upload.searchResults.length - 2 })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleViewCV(upload._id)}
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                  >
                    <Eye className="mr-1 h-3 w-3" />
                    {t('uploads_history.actions.view')}
                  </Button>
                  
                  {upload.hasResults && (
                    <Button
                      onClick={() => onViewResults?.(upload.searchResults[0].workflowId)}
                      size="sm"
                      className="flex-1 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <BarChart3 className="mr-1 h-3 w-3" />
                      {t('uploads_history.actions.view_results')}
                    </Button>
                  )}
                  
                  <Button
                    onClick={() => handleDeleteCV(upload._id, upload.originalFileName)}
                    size="sm"
                    variant="outline"
                    className="border-destructive/20 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadsHistory; 