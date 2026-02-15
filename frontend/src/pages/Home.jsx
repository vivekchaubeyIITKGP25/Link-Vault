import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Lock, Eye, Hash, Clock, History as HistoryIcon } from 'lucide-react';
import { uploadContent } from '../services/api';
import toast from 'react-hot-toast';

const Home = () => {
  const navigate = useNavigate();
  const [uploadType, setUploadType] = useState('text');
  const [textContent, setTextContent] = useState('');
  const [file, setFile] = useState(null);
  const [expiryDateTime, setExpiryDateTime] = useState('');
  const [password, setPassword] = useState('');
  const [oneTimeView, setOneTimeView] = useState(false);
  const [maxViews, setMaxViews] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const heroRef = useRef(null);

  useEffect(() => {
    const node = heroRef.current;
    if (!node) return;

    window.scrollTo(0, 0);

    let rafId = null;
    const update = () => {
      const progress = Math.min(Math.max(window.scrollY / 320, 0), 1);
      node.style.setProperty('--fade', (1 - progress).toFixed(3));
      node.style.setProperty('--lock', progress.toFixed(3));
      node.style.setProperty('--shift-left', `${-progress * 120}px`);
      node.style.setProperty('--shift-right', `${progress * 120}px`);
      node.style.setProperty('--lift', `${-progress * 18}px`);
      node.style.setProperty('--scale', `${1 - progress * 0.08}`);
      node.style.setProperty('--blur', `${progress * 1.2}px`);
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        update();
        rafId = null;
      });
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', update);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (uploadType === 'text' && !textContent.trim()) {
      toast.error('Please enter some text');
      return;
    }

    if (uploadType === 'file' && !file) {
      toast.error('Please select a file');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      
      if (uploadType === 'text') {
        formData.append('textContent', textContent);
      } else {
        formData.append('file', file);
      }

      if (expiryDateTime) {
        formData.append('expiryDateTime', expiryDateTime);
      }
      
      if (password) {
        formData.append('password', password);
      }
      
      if (oneTimeView) {
        formData.append('oneTimeView', 'true');
      }
      
      if (maxViews) {
        formData.append('maxViews', maxViews);
      }

      const response = await uploadContent(formData);

      if (response.success) {
        toast.success('Content uploaded successfully!');
        navigate('/success', { state: { data: response.data } });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload content');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div
        aria-hidden
        className="absolute -top-32 right-6 h-72 w-72 rounded-full bg-amber-300/30 blur-3xl float-slow pulse-soft"
      />
      <div
        aria-hidden
        className="absolute -bottom-40 -left-10 h-80 w-80 rounded-full bg-teal-300/25 blur-3xl float-slower pulse-soft"
      />

      <main className="relative z-10 mx-auto w-full max-w-6xl px-6 py-12 lg:py-16">
        <section ref={heroRef} className="hero-split-wrap">
          <div className="hero-split-title">
            <span className="hero-word hero-word--left">Link</span>
            <span className="hero-lock" aria-hidden>
              <Lock className="h-5 w-5" />
            </span>
            <span className="hero-word hero-word--right">Vault</span>
          </div>
          <p className="hero-split-subtitle">
            Secure links in seconds
          </p>
        </section>

        <div className="home-content w-full">
          <div className="mx-auto w-full max-w-2xl space-y-6">
            <section className="card animate-slide-up">
              <form onSubmit={handleSubmit}>
              <div className="mb-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setUploadType('text')}
                  className={`tab-btn ${uploadType === 'text' ? 'tab-btn-active' : ''}`}
                >
                  <FileText className="inline-block h-5 w-5 mr-2" />
                  Text
                </button>
                <button
                  type="button"
                  onClick={() => setUploadType('file')}
                  className={`tab-btn ${uploadType === 'file' ? 'tab-btn-active' : ''}`}
                >
                  <Upload className="inline-block h-5 w-5 mr-2" />
                  File
                </button>
              </div>

              <div className="mb-6">
                <div key={uploadType} className="tab-panel animate-slide-up">
                  {uploadType === 'text' ? (
                    <div>
                      <label className="block text-sm font-medium text-ink mb-2">
                        Your Text
                      </label>
                      <textarea
                        value={textContent}
                        onChange={(e) => setTextContent(e.target.value)}
                        className="input-field min-h-[140px] resize-y"
                        placeholder="Paste or type your text here..."
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-ink mb-2">
                        Choose File
                      </label>
                      <div className="upload-zone rounded-2xl border border-dashed border-amber-200/80 bg-white/60 p-8 text-center transition-colors hover:border-amber-400">
                        <input
                          type="file"
                          onChange={handleFileChange}
                          className="hidden"
                          id="file-upload"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer">
                          {file ? (
                            <div className="text-ink">
                              <FileText className="w-12 h-12 mx-auto mb-2 text-amber-500" />
                              <p className="font-medium">{file.name}</p>
                              <p className="text-sm text-ink-soft">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          ) : (
                            <div className="text-ink-soft">
                              <Upload className="w-12 h-12 mx-auto mb-2 text-amber-400" />
                              <p>Click to select a file</p>
                              <p className="text-sm">Maximum size: 10MB</p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-ink mb-2">
                  <Clock className="w-4 h-4 inline-block mr-1" />
                  Expiry Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={expiryDateTime}
                  onChange={(e) => setExpiryDateTime(e.target.value)}
                  className="input-field"
                  min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                />
                <p className="mt-2 text-xs text-ink-soft">
                  Leave empty to use default expiry of 10 minutes.
                </p>
              </div>

              <details className="card-soft mb-6">
                <summary className="font-medium text-ink cursor-pointer select-none">
                  Privacy Options
                </summary>

                <div className="mt-4">
                  <div className="mb-4">
                    <label className="block text-sm text-ink-soft mb-2">
                      <Lock className="w-4 h-4 inline-block mr-1" />
                      Password Protection
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field"
                      placeholder="Leave empty for no password"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="flex items-center cursor-pointer gap-2 text-sm text-ink-soft">
                      <input
                        type="checkbox"
                        checked={oneTimeView}
                        onChange={(e) => setOneTimeView(e.target.checked)}
                        className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400"
                      />
                      <Eye className="w-4 h-4" />
                      One-time view (owner once + one recipient once)
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm text-ink-soft mb-2">
                      <Hash className="w-4 h-4 inline-block mr-1" />
                      Maximum Views
                    </label>
                    <input
                      type="number"
                      value={maxViews}
                      onChange={(e) => setMaxViews(e.target.value)}
                      className="input-field"
                      placeholder="Leave empty for unlimited"
                      min="1"
                    />
                  </div>
                </div>
              </details>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-3 text-lg"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Uploading...
                  </span>
                ) : (
                  'Generate Link'
                )}
              </button>

              <p className="text-center text-ink-soft text-sm mt-6">
                Links expire automatically. Share securely and confidently.
              </p>
              </form>
            </section>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => navigate('/history')}
                className="btn-secondary"
              >
                <HistoryIcon className="w-4 h-4 inline-block mr-2" />
                Links History
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
