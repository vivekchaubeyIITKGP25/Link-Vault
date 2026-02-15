import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Eye, History as HistoryIcon, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { deleteContent, getContentHistory } from '../services/api';

const History = () => {
  const navigate = useNavigate();
  const [historyItems, setHistoryItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const response = await getContentHistory();
        if (response?.success) {
          setHistoryItems(response.data.items || []);
        }
      } catch (error) {
        console.error('Failed to load link history', error);
        toast.error('Failed to load link history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleDelete = async (uniqueId) => {
    const ok = window.confirm('Delete this content? This cannot be undone.');
    if (!ok) return;

    try {
      await deleteContent(uniqueId);
      setHistoryItems((prev) => prev.filter((item) => item.uniqueId !== uniqueId));
      toast.success('Content deleted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete content');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <main className="relative z-10 mx-auto w-full max-w-6xl px-6 py-10 lg:py-14">
        <section className="card">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-ink flex items-center gap-2">
                <HistoryIcon className="h-6 w-6 text-amber-500" />
                Link History
              </h1>
              <p className="text-sm text-ink-soft mt-1">All links you created.</p>
            </div>
            <button type="button" onClick={() => navigate('/')} className="btn-secondary">
              <ArrowLeft className="w-4 h-4 inline-block mr-2" />
              Back
            </button>
          </div>

          {isLoading ? (
            <p className="text-sm text-ink-soft">Loading history...</p>
          ) : historyItems.length === 0 ? (
            <p className="text-sm text-ink-soft">No links found yet.</p>
          ) : (
            <div className="space-y-3">
              {historyItems.map((item) => (
                <div key={item.uniqueId} className="card-soft flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-ink">
                      {item.type === 'file' ? item.fileName || 'File' : 'Text'}
                    </p>
                    <p className="text-xs text-ink-soft">Created: {new Date(item.createdAt).toLocaleString()}</p>
                    <p className="text-xs text-ink-soft">Expires: {new Date(item.expiresAt).toLocaleString()}</p>
                    <p className="text-xs text-ink-soft flex items-center gap-1 mt-1">
                      <Eye className="h-3.5 w-3.5 text-amber-500" />
                      People accessed: {item.viewCount || 0}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="badge text-xs">
                      {item.isExpired ? 'Expired' : 'Active'}
                    </span>
                    <a
                      href={item.shareUrl}
                      className="btn-secondary"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ExternalLink className="w-4 h-4 inline-block mr-2" />
                      Open
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.uniqueId)}
                      className="btn-secondary"
                    >
                      <Trash2 className="w-4 h-4 inline-block mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default History;
