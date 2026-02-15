import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle, Copy, ExternalLink, Home as HomeIcon, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { deleteContent } from '../services/api';

const Success = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const data = location.state?.data;

  if (!data) {
    navigate('/');
    return null;
  }

  const { shareUrl, expiresAt, type, uniqueId } = data;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleDelete = async () => {
    if (deleting) return;
    const ok = window.confirm('Delete this content? This cannot be undone.');
    if (!ok) return;
    setDeleting(true);
    try {
      await deleteContent(uniqueId);
      toast.success('Content deleted');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete content');
    } finally {
      setDeleting(false);
    }
  };

  const formatExpiryTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = date - now;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div
        aria-hidden
        className="absolute -top-32 right-10 h-72 w-72 rounded-full bg-amber-300/30 blur-3xl float-slow pulse-soft"
      />
      <div
        aria-hidden
        className="absolute -bottom-40 -left-10 h-80 w-80 rounded-full bg-teal-300/25 blur-3xl float-slower pulse-soft"
      />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-12">
        <div className="card w-full text-center animate-slide-up">
          <div className="badge mx-auto mb-6">Link ready to share</div>

          <div className="mb-6">
            <div className="bg-amber-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto success-burst">
              <CheckCircle className="w-12 h-12 text-amber-600" />
            </div>
          </div>

          <h1 className="font-display text-3xl text-ink mb-2">
            {type === 'text' ? 'Text' : 'File'} Uploaded Successfully
          </h1>
          <p className="text-ink-soft mb-8">
            Your content is ready to share securely.
          </p>

          <div className="card-soft mb-6 text-left">
            <label className="block text-sm font-medium text-ink mb-3">
              Your Shareable Link
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="input-field flex-1 font-mono text-sm"
              />
              <button
                onClick={copyToClipboard}
                className="btn-primary px-6 whitespace-nowrap"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-5 h-5 inline-block mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5 inline-block mr-2" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-left stagger">
            <div className="card-soft">
              <p className="text-sm text-ink-soft mb-1">Content Type</p>
              <p className="text-lg font-semibold text-ink capitalize">{type}</p>
            </div>
            <div className="card-soft">
              <p className="text-sm text-ink-soft mb-1">Expires In</p>
              <p className="text-lg font-semibold text-ink">
                {formatExpiryTime(expiresAt)}
              </p>
            </div>
          </div>

          <div className="notice mb-6 flex items-start gap-3 text-left">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600" />
            <p className="text-sm">
              Save this link. After leaving this page, you won't be able to retrieve it again.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <button
              onClick={() => navigate('/')}
              className="btn-secondary flex-1 py-3"
            >
              <HomeIcon className="w-5 h-5 inline-block mr-2" />
              Upload Another
            </button>
            <button
              onClick={handleDelete}
              className="btn-secondary flex-1 py-3"
              disabled={deleting}
            >
              <Trash2 className="w-5 h-5 inline-block mr-2" />
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary flex-1 py-3 text-center"
            >
              <ExternalLink className="w-5 h-5 inline-block mr-2" />
              Open Link
            </a>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Success;
