export const RD_LAB = [
  {
    id: 'aether-ebpf-security',
    name: 'Aether-eBPF Security Guard',
    tagline: 'Zero-Overhead Linux Kernel Threat Detection Engine',
    desc: 'A production-grade kernel observability and runtime security runtime built on eBPF (Extended Berkeley Packet Filter) and Rust. Intercepts low-level syscalls without kernel modification to prevent container escapes, unauthorized privilege escalation, and zero-day execution in Kubernetes clusters.',
    tag: 'KERNEL & CYBERSECURITY',
    highlights: [
      'Sub-1% CPU overhead using ring-buffer zero-copy event transport',
      'Ring-0 syscall interception and dynamic LSM (Linux Security Module) hooks',
      'eBPF bytecode verification & CO-RE (Compile Once – Run Everywhere) support',
    ],
    stack: ['Rust', 'eBPF / libbpf', 'C', 'Linux Kernel Internals', 'Docker/K8s'],
    status: 'PRODUCTION_READY',
  },
  {
    id: 'aegis-formal-verifier',
    name: 'Aegis Formal Verifier',
    tagline: 'Automated Symbolic Execution Engine for EVM & ZK Circuits',
    desc: 'An advanced formal verification tool designed to audit complex smart contracts and Zero-Knowledge (ZK-SNARK/STARK) constraint systems. Uses SAT/SMT solvers (Z3) to mathematically prove invariant conditions and identify logic flaws, reentrancy vulnerabilities, and arithmetic overflow.',
    tag: 'FORMAL VERIFICATION & WEB3',
    highlights: [
      'Automated SMT-based constraint solver integration (Z3/CVC5)',
      'Bytecode-level control flow graph (CFG) generation & symbolic execution',
      'Full coverage audit pipeline for Circom, Halo2, and Solidity contracts',
    ],
    stack: ['Rust', 'Z3 SMT Solver', 'Solidity', 'Yul', 'Circom', 'EVM Bytecode'],
    status: 'PRODUCTION_READY',
  },
  {
    id: 'hyperion-volumetric-webgpu',
    name: 'Hyperion Volumetric WebGPU',
    tagline: 'Real-Time 3D Gaussian Splatting & Compute Shader Engine',
    desc: 'A cutting-edge spatial computing rendering engine capable of displaying photorealistic 3D scenes reconstructed from point clouds. Harnesses WebGPU compute shaders for parallel radix sorting and rasterization, maintaining a steady 60 FPS on modern hardware.',
    tag: 'GRAPHICS & SPATIAL COMPUTING',
    highlights: [
      'Parallel GPU Radix Sort implemented directly in WGSL compute shaders',
      'Sub-16ms frame time for 1M+ Gaussian splat point clouds',
      'Zero-copy memory transfer between WebGPU compute and render pipelines',
    ],
    stack: ['WebGPU', 'WGSL', 'TypeScript', 'Linear Algebra / Matrix Math'],
    status: 'ACTIVE_RESEARCH',
  },
  {
    id: 'chronos-lob-engine',
    name: 'Chronos LOB Matching Engine',
    tagline: 'Sub-Microsecond Deterministic Financial Matching Infrastructure',
    desc: 'A high-frequency trading (HFT) limit order book execution engine engineered for ultra-low latency. Eliminates heap allocations during execution via pre-allocated lock-free ring buffers and utilizes AVX-512 SIMD instructions for continuous price-time priority order matching.',
    tag: 'LOW-LATENCY SYSTEMS',
    highlights: [
      'Sub-800 nanosecond p99 order execution latency',
      'Zero-allocation memory strategy using custom arena allocators',
      'SIMD-vectorized price level searching and cache-line aligned data structures',
    ],
    stack: ['C++20', 'Rust', 'AVX-512 SIMD', 'Lock-Free Queues', 'POSIX Realtime'],
    status: 'PRODUCTION_READY',
  },
] as const;

export type RdLabEntry = (typeof RD_LAB)[number];
export type RdLabTag = RdLabEntry['tag'];
export type RdLabStatus = RdLabEntry['status'];