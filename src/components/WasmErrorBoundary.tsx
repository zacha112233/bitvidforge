'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, Cpu, RefreshCw, ShieldAlert, Terminal } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string | null;
  capabilitiesChecked: boolean;
  hasWasm: boolean;
  hasSharedArrayBuffer: boolean;
  hasSimd: boolean;
  crossOriginIsolated: boolean;
  dismissedWarning: boolean;
}

/**
 * Validates WebAssembly 128-bit SIMD support using a minimal valid WASM binary header + v128.const instruction.
 */
function checkWasmSimd(): boolean {
  try {
    if (typeof WebAssembly !== 'object' || typeof WebAssembly.validate !== 'function') {
      return false;
    }
    const simdTestBytes = new Uint8Array([
      0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0,
      253, 15, 253, 98, 11,
    ]);
    return WebAssembly.validate(simdTestBytes);
  } catch {
    return false;
  }
}

export class WasmErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: null,
      capabilitiesChecked: false,
      hasWasm: true,
      hasSharedArrayBuffer: true,
      hasSimd: true,
      crossOriginIsolated: true,
      dismissedWarning: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      errorMessage: error.message || 'Unexpected WebAssembly runtime error.',
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[WasmErrorBoundary] Caught runtime error:', error, errorInfo);
  }

  componentDidMount() {
    const hasWasm =
      typeof window !== 'undefined' &&
      typeof WebAssembly === 'object' &&
      typeof WebAssembly.instantiate === 'function';
    const hasSharedArrayBuffer =
      typeof window !== 'undefined' && typeof SharedArrayBuffer !== 'undefined';
    const hasSimd = checkWasmSimd();
    const crossOriginIsolated =
      typeof window !== 'undefined' && Boolean(window.crossOriginIsolated);

    this.setState({
      capabilitiesChecked: true,
      hasWasm,
      hasSharedArrayBuffer,
      hasSimd,
      crossOriginIsolated,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      errorMessage: null,
    });
  };

  render() {
    const {
      hasError,
      errorMessage,
      capabilitiesChecked,
      hasWasm,
      hasSharedArrayBuffer,
      hasSimd,
      crossOriginIsolated,
      dismissedWarning,
    } = this.state;

    // Critical fallback if WebAssembly is absent or an unhandled error occurred
    if (hasError || (capabilitiesChecked && !hasWasm)) {
      return (
        <div className="min-h-screen bg-[#090b10] text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-xl w-full rounded-2xl border border-amber-500/30 bg-[#11151f] p-8 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400 mb-4">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Browser Environment Incompatible
                </h2>
                <p className="text-xs text-amber-300/80 font-mono">
                  WASM_SIMD / SHARED_ARRAY_BUFFER_CHECK
                </p>
              </div>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              This video compressor runs 100% client-side in your browser using{' '}
              <span className="text-white font-medium">WebAssembly (FFmpeg.wasm)</span>,{' '}
              <span className="text-white font-medium">WebAssembly SIMD</span>, and{' '}
              <span className="text-white font-medium">SharedArrayBuffer</span>. Your current
              browser environment either lacks required WebAssembly features or encountered a
              runtime execution error.
            </p>

            {errorMessage && (
              <div className="mb-6 rounded-xl bg-black/50 border border-slate-800 p-4 font-mono text-xs text-rose-400 flex items-start gap-2.5">
                <Terminal className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="break-all">{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 text-xs">
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block mb-1">WebAssembly Core</span>
                <span className={hasWasm ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                  {hasWasm ? 'Supported' : 'Missing'}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block mb-1">SharedArrayBuffer</span>
                <span
                  className={
                    hasSharedArrayBuffer ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'
                  }
                >
                  {hasSharedArrayBuffer ? 'Active (COOP/COEP)' : 'Unavailable'}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block mb-1">WASM SIMD</span>
                <span className={hasSimd ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                  {hasSimd ? 'Enabled' : 'Unsupported'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition"
              >
                <RefreshCw className="w-4 h-4" />
                Retry Initialization
              </button>
              <span className="text-xs text-slate-400">
                Recommended: Latest Chrome, Edge, Firefox, or Safari 16.4+ over HTTPS/localhost.
              </span>
            </div>
          </div>
        </div>
      );
    }

    const showEnvironmentNotice =
      capabilitiesChecked && (!hasSharedArrayBuffer || !hasSimd || !crossOriginIsolated) && !dismissedWarning;

    return (
      <>
        {showEnvironmentNotice && (
          <div
            role="alert"
            className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-3 text-amber-200 text-xs"
          >
            <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Browser Capability Warning:</strong>{' '}
                  {!hasSharedArrayBuffer || !crossOriginIsolated
                    ? 'SharedArrayBuffer / Cross-Origin Isolation is not active. '
                    : ''}
                  {!hasSimd ? 'WebAssembly SIMD is not detected. ' : ''}
                  Falling back to single-threaded WebAssembly execution mode. Ensure COOP (
                  <code>same-origin</code>) and COEP (<code>require-corp</code>) headers are active.
                </span>
              </div>
              <button
                type="button"
                onClick={() => this.setState({ dismissedWarning: true })}
                className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 font-medium shrink-0"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
        {this.props.children}
      </>
    );
  }
}
