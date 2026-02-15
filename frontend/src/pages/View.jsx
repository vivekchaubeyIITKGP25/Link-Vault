import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  AlertCircle,
  CheckCircle,
  Clock,
  Copy,
  Download,
  Eye,
  FileText,
  Lock,
  ShieldCheck,
  Trash2,
  XCircle
} from 'lucide-react';
import { getContentInfo, getContent, deleteContent } from '../services/api';
import LogoMark from '../components/LogoMark';
import toast from 'react-hot-toast';

const View = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [isOneTimeView, setIsOneTimeView] = useState(false);
  const [viewerIsOwner, setViewerIsOwner] = useState(false);
  const [confirmOneTimeView, setConfirmOneTimeView] = useState(false);
  const [letterOpened, setLetterOpened] = useState(false);
  const [password, setPassword] = useState('');
  const [content, setContent] = useState(null);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setError(null);
    setRequiresPassword(false);
    setIsOneTimeView(false);
    setViewerIsOwner(false);
    setConfirmOneTimeView(false);
    setLetterOpened(false);
    setPassword('');
    setContent(null);
    fetchContentInfo();
  }, [id]);

  const fetchContentInfo = async () => {
    try {
      setLoading(true);
      const response = await getContentInfo(id);

      const info = response.data;
      setRequiresPassword(!!info.requiresPassword);
      setIsOneTimeView(!!info.oneTimeView);
      setViewerIsOwner(!!info.isOwner);

      if (info.requiresPassword) {
        setRequiresPassword(true);
        setLoading(false);
      } else if (info.oneTimeView) {
        // Avoid auto-fetching one-time links so they are consumed only on explicit user action.
        setConfirmOneTimeView(true);
        setLoading(false);
      } else {
        await fetchContent();
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setError('Please login to view this content.');
      } else if (error.response?.status === 403) {
        setError('You do not have access to this content.');
      } else {
        setError(error.response?.data?.message || 'Content not found or has expired');
      }
      setLoading(false);
    }
  };

  const fetchContent = async (pwd = null) => {
    try {
      setLoading(true);
      setConfirmOneTimeView(false);
      const response = await getContent(id, pwd);
      setContent(response.data);
      setError(null);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        setError('Incorrect password');
      } else {
        setError(error.response?.data?.message || 'Failed to load content');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOneTimeView = () => {
    fetchContent();
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!password) {
      toast.error('Please enter password');
      return;
    }
    fetchContent(password);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content.textContent);
      setCopied(true);
      toast.success('Text copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy text');
    }
  };

  const handleDownload = () => {
    window.open(content.fileUrl, '_blank');
  };

  const handleDelete = async () => {
    if (!content || deleting) return;
    const ok = window.confirm('Delete this content? This cannot be undone.');
    if (!ok) return;
    setDeleting(true);
    try {
      await deleteContent(id);
      toast.success('Content deleted');
      window.location.href = '/';
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete content');
    } finally {
      setDeleting(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const Shell = ({ children, containerClassName = 'max-w-md' }) => (
    <div className="min-h-screen relative overflow-hidden">
      <div
        aria-hidden
        className="absolute -top-32 right-10 h-72 w-72 rounded-full bg-amber-300/30 blur-3xl float-slow pulse-soft"
      />
      <div
        aria-hidden
        className="absolute -bottom-40 -left-10 h-80 w-80 rounded-full bg-teal-300/25 blur-3xl float-slower pulse-soft"
      />
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-12">
        <div className={`w-full ${containerClassName}`}>{children}</div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <Shell>
        <div className="card text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-200 border-t-amber-500 mx-auto mb-4"></div>
          <p className="text-ink-soft">Loading content...</p>
        </div>
      </Shell>
    );
  }

  if (error && !requiresPassword) {
    return (
      <Shell>
        <div className="card text-center">
          <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-2xl font-semibold text-ink mb-2">Content Not Found</h1>
          <p className="text-ink-soft mb-6">{error}</p>
          <a href="/" className="btn-primary inline-block">
            Go to Homepage
          </a>
        </div>
      </Shell>
    );
  }

  if (requiresPassword && !content) {
    return (
      <Shell>
        <div className="card">
          <div className="text-center mb-6">
            <div className="badge mx-auto mb-4">Protected Link</div>
            <div className="bg-amber-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-12 h-12 text-amber-600" />
            </div>
            <h1 className="text-2xl font-semibold text-ink mb-2">Password Required</h1>
            <p className="text-ink-soft">
              Enter the password to access this content.
              {isOneTimeView
                ? viewerIsOwner
                  ? ' This is your one-time owner preview.'
                  : ' This is a one-time recipient access.'
                : ''}
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Enter password"
                autoFocus
              />
            </div>
            {error && (
              <div className="notice mb-4">
                <p className="text-sm">{error}</p>
              </div>
            )}
            <button type="submit" className="btn-primary w-full">
              Unlock Content
            </button>
          </form>
        </div>
      </Shell>
    );
  }

  if (confirmOneTimeView && !content) {
    return (
      <Shell>
        <div className="card text-center">
          <div className="badge mx-auto mb-4">One-Time Link</div>
          <h1 className="text-2xl font-semibold text-ink mb-2">
            {viewerIsOwner ? 'Owner Preview' : 'Recipient Access'}
          </h1>
          <p className="text-ink-soft mb-6">
            {viewerIsOwner
              ? 'You can open this once as the owner. After that, one recipient can still open once.'
              : 'You can open this once as a recipient. After that, recipient access will be closed.'}
          </p>
          <button
            type="button"
            onClick={handleOneTimeView}
            className="btn-primary"
            disabled={loading}
          >
            View Content Once
          </button>
        </div>
      </Shell>
    );
  }

  if (!content) {
    return null;
  }

  const detailItems = [
    {
      label: 'Created',
      value: formatDate(content.createdAt),
      icon: Clock,
    },
    {
      label: 'Expires',
      value: formatDate(content.expiresAt),
      icon: AlertCircle,
    },
  ];

  if (content.maxViews) {
    detailItems.push({
      label: 'Views',
      value: `${content.viewCount}/${content.maxViews}`,
      icon: Eye,
    });
  }

  return (
    <Shell containerClassName={letterOpened ? 'max-w-5xl' : 'max-w-2xl'}>
      {!letterOpened ? (
        <div className="card text-center">
          <div className="mx-auto w-full max-w-sm">
            <div className="relative mx-auto w-72 sm:w-80 rotate-[-6deg]">
              <div className="relative overflow-hidden rounded-2xl border border-amber-900/25 bg-gradient-to-br from-amber-200 via-amber-100 to-orange-200 p-2 shadow-[0_16px_30px_rgba(120,53,15,0.28)]">
                <svg viewBox="0 0 640 420" className="h-auto w-full rounded-xl">
                  <rect x="10" y="10" width="620" height="400" rx="22" fill="rgba(146,64,14,0.07)" stroke="rgba(120,53,15,0.32)" strokeWidth="2" />
                  <line x1="10" y1="10" x2="320" y2="195" stroke="rgba(120,53,15,0.42)" strokeWidth="2.5" />
                  <line x1="630" y1="10" x2="320" y2="195" stroke="rgba(120,53,15,0.42)" strokeWidth="2.5" />
                </svg>
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(255,255,255,0.45),transparent_45%),radial-gradient(circle_at_78%_82%,rgba(120,53,15,0.15),transparent_35%)]" />
                <div className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2">
                  <div className="relative h-14 w-14 rounded-full bg-gradient-to-br from-red-500 via-red-600 to-red-800 shadow-[0_12px_20px_rgba(127,29,29,0.4)]">
                    <div className="absolute inset-2 rounded-full border border-red-200/40" />
                    <div className="absolute inset-[7px] rounded-full border border-red-950/25" />
                    <div className="absolute inset-[10px] rounded-full border border-red-950/35 bg-red-700/55 overflow-hidden flex items-center justify-center">
                      <LogoMark className="h-5 w-5 !rounded-none !object-contain mix-blend-screen opacity-95" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="text-ink-soft mt-8 mb-6">
            This envelope contains protected content from LinkVault.
          </p>
          <button
            type="button"
            onClick={() => setLetterOpened(true)}
            className="btn-primary"
          >
            Open Letter
          </button>
        </div>
      ) : (
        <div className="space-y-6 stagger">
          <div className="card">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-[0_8px_16px_rgba(15,23,42,0.32)]">
                  <LogoMark className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-display text-ink">
                    {content.type === 'text' ? 'Opened Letter' : 'Opened File'}
                  </h1>
                  {content.type === 'file' && (
                    <p
                      className="mt-1 max-w-[70vw] sm:max-w-[34rem] overflow-hidden text-ellipsis whitespace-nowrap text-sm text-ink-soft"
                      title={content.fileName}
                    >
                      {content.fileName}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="badge">
                      <ShieldCheck className="h-4 w-4 text-amber-600" />
                      Security Verified
                    </span>
                    <span className="badge">
                      {content.type === 'text' ? 'Text Content' : 'File Content'}
                    </span>
                    {isOneTimeView && (
                      <span className="badge">
                        One-Time Access
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {viewerIsOwner && (
                <button onClick={handleDelete} className="btn-secondary">
                  <Trash2 className="w-4 h-4 inline-block mr-2" />
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {detailItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="card-soft !p-4">
                    <p className="text-xs uppercase tracking-wide text-ink-soft">{item.label}</p>
                    <p className="mt-2 text-sm text-ink flex items-start gap-2">
                      <Icon className="w-4 h-4 mt-0.5 text-amber-600" />
                      <span>{item.value}</span>
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {content.type === 'text' ? (
            <div className="card">
              <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
                <h2 className="text-lg font-semibold text-ink">Letter Content</h2>
                <button onClick={copyToClipboard} className="btn-secondary">
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4 inline-block mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 inline-block mr-2" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div className="rounded-xl border border-amber-900/15 bg-gradient-to-b from-amber-50 to-orange-50 p-1">
                <div className="text-content-box rounded-lg p-6 font-mono text-sm whitespace-pre-wrap break-words max-h-[600px] overflow-y-auto border border-black/5">
                  {content.textContent}
                </div>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="text-center">
                <div className="bg-amber-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-10 h-10 text-amber-600" />
                </div>
                <h2 className="text-xl font-semibold text-ink mb-2 break-all">
                  {content.fileName}
                </h2>
                <p className="text-ink-soft mb-6">
                  Size: {formatFileSize(content.fileSize)}
                </p>
                <button onClick={handleDownload} className="btn-primary px-8 py-3">
                  <Download className="w-5 h-5 inline-block mr-2" />
                  Download File
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </Shell>
  );
};

export default View;
