// ---------------------------------------------------------------------------
// documents.js — swap this export for an API call to connect real data.
// The Documents tab groups everything a buyer needs for the renewal review.
// Contract history is one document type among several (see contractHistory.js).
// ---------------------------------------------------------------------------

// Each group renders as a section in the Documents tab.
// kind: 'docs'      -> list of document rows (below)
//       'contracts' -> renders the contract history table from contractHistory.js
//
// Document fields:
//   name        display title
//   description one-line summary
//   format      'PDF' | 'DOCX' | 'Link'  (drives the file badge + action verb)
//   date        last-updated date (ISO)
//   size        human size string (omit for links)
//   url         opens in a new tab when present (links + live agreements)
//   tag         optional small pill, e.g. 'Updated', 'Required to sign'

export const documentGroups = [
  {
    id: 'legal',
    title: 'Legal & Compliance',
    blurb: 'Master agreement, data terms, and security attestations',
    icon: 'shield',
    kind: 'docs',
    documents: [
      {
        id: 'msa',
        name: 'Master Service Agreement',
        description: 'Governing terms for your LeanData subscription',
        format: 'Link',
        date: '2026-06-01',
        url: 'https://www.leandata.com/terms-of-service/',
        tag: 'Required to sign',
      },
      {
        id: 'dpa',
        name: 'Data Processing Agreement',
        description: 'Privacy & GDPR data terms — for your Legal team',
        format: 'PDF',
        date: '2026-05-28',
        size: '412 KB',
        tag: 'Updated',
      },
      {
        id: 'soc2',
        name: 'SOC 2 Type II Report',
        description: 'Security & compliance — for your InfoSec review',
        format: 'PDF',
        date: '2026-02-14',
        size: '2.1 MB',
      },
    ],
  },
  {
    id: 'contracts',
    title: 'Contract History',
    blurb: 'Every signed term and the proposed renewal',
    icon: 'history',
    kind: 'contracts',
  },
  {
    id: 'product',
    title: 'Product Briefs',
    blurb: 'One-pagers for the products on your plan',
    icon: 'package',
    kind: 'docs',
    documents: [
      {
        id: 'brief-orchestration',
        name: 'Orchestration — Product Brief',
        description: 'Lead routing and assignment automation',
        format: 'PDF',
        date: '2026-04-09',
        size: '1.4 MB',
        url: 'https://www.leandata.com/product/orchestration',
      },
      {
        id: 'brief-scheduling',
        name: 'Scheduling — Product Brief',
        description: 'Territory and capacity management',
        format: 'PDF',
        date: '2026-04-09',
        size: '1.1 MB',
        url: 'https://www.leandata.com/product/scheduling',
      },
    ],
  },
];
