const fs = require('fs');
const path = require('path');

const rootDir = '/Users/vytvytskyi/foryou_partners';

const fixes = [
  {
    file: 'src/components/admin/UserModal.tsx',
    interface: 'UserModalProps',
    funcRegex: /export function UserModal\(\{\s*user,\s*onClose,\s*onStatusChange(\s*,)?\s*dict\s*\}\s*:\s*UserModalProps\)/
  },
  {
    file: 'src/components/admin/UserTicketsSubModal.tsx',
    interface: 'UserTicketsSubModalProps',
    funcRegex: /export function UserTicketsSubModal\(\{\s*userId,\s*onClose(\s*,)?\s*dict\s*\}\s*:\s*UserTicketsSubModalProps\)/
  },
  {
    file: 'src/components/deals/LeadChat.tsx',
    interface: 'LeadChatProps',
    funcRegex: /export function LeadChat\(\{\s*dealId,\s*brokerName(\s*,)?\s*dict\s*\}\s*:\s*LeadChatProps\)/
  },
  {
    file: 'src/components/leads/LeadDrawer.tsx',
    interface: 'LeadDrawerProps',
    funcRegex: /export function LeadDrawer\(\{\s*leadId,\s*isOpen,\s*onClose(\s*,)?\s*dict\s*\}\s*:\s*LeadDrawerProps\)/
  },
  {
    file: 'src/components/payouts/RequestPayoutModal.tsx',
    interface: 'RequestPayoutModalProps',
    funcRegex: /export function RequestPayoutModal\(\{\s*isOpen,\s*onClose,\s*availableAmount(\s*,)?\s*dict\s*\}\s*:\s*RequestPayoutModalProps\)/ // actually maxAmount
  },
  {
    file: 'src/components/support/CreateTicketModal.tsx',
    interface: 'CreateTicketModalProps',
    funcRegex: /export function CreateTicketModal\(\{\s*isOpen,\s*onClose,\s*onSuccess(\s*,)?\s*dict\s*\}\s*:\s*CreateTicketModalProps\)/
  }
];

for (const { file: relPath, interface: iface, funcRegex } of fixes) {
  const filePath = path.join(rootDir, relPath);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // 1. Add dict?: any; to the interface
    const ifaceRegex = new RegExp(`interface ${iface} \\{[^}]*\\}`);
    const match = content.match(ifaceRegex);
    if (match && !match[0].includes('dict?: any')) {
      const newIface = match[0].replace('}', '  dict?: any;\n}');
      content = content.replace(match[0], newIface);
    }
    
    // 2. Add dict to the function signature
    if (relPath === 'src/components/admin/UserModal.tsx') {
      content = content.replace(/export function UserModal\(\{\s*user,\s*onClose,\s*onStatusChange\s*\}\s*:\s*UserModalProps\)/, 'export function UserModal({ user, onClose, onStatusChange, dict }: UserModalProps)');
    } else if (relPath === 'src/components/admin/UserTicketsSubModal.tsx') {
      content = content.replace(/export function UserTicketsSubModal\(\{\s*userId,\s*onClose\s*\}\s*:\s*UserTicketsSubModalProps\)/, 'export function UserTicketsSubModal({ userId, onClose, dict }: UserTicketsSubModalProps)');
    } else if (relPath === 'src/components/deals/LeadChat.tsx') {
      content = content.replace(/export function LeadChat\(\{\s*dealId,\s*brokerName\s*\}\s*:\s*LeadChatProps\)/, 'export function LeadChat({ dealId, brokerName, dict }: LeadChatProps)');
    } else if (relPath === 'src/components/leads/LeadDrawer.tsx') {
      content = content.replace(/export function LeadDrawer\(\{\s*leadId,\s*isOpen,\s*onClose\s*\}\s*:\s*LeadDrawerProps\)/, 'export function LeadDrawer({ leadId, isOpen, onClose, dict }: LeadDrawerProps)');
    } else if (relPath === 'src/components/payouts/RequestPayoutModal.tsx') {
      content = content.replace(/export function RequestPayoutModal\(\{\s*isOpen,\s*onClose,\s*onSuccess,\s*maxAmount\s*\}\s*:\s*RequestPayoutModalProps\)/, 'export function RequestPayoutModal({ isOpen, onClose, onSuccess, maxAmount, dict }: RequestPayoutModalProps)');
    } else if (relPath === 'src/components/support/CreateTicketModal.tsx') {
      content = content.replace(/export function CreateTicketModal\(\{\s*isOpen,\s*onClose,\s*onSuccess\s*\}\s*:\s*CreateTicketModalProps\)/, 'export function CreateTicketModal({ isOpen, onClose, onSuccess, dict }: CreateTicketModalProps)');
    }
    
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('Fixed', relPath);
  }
}

// Special cases:
// AppShell.tsx
let appShellPath = path.join(rootDir, 'src/components/layout/AppShell.tsx');
if (fs.existsSync(appShellPath)) {
  let content = fs.readFileSync(appShellPath, 'utf-8');
  content = content.replace(/export function AppShell\(\{\s*children\s*\}\s*:\s*\{\s*children:\s*React\.ReactNode\s*\}\)\s*\{/, 'export function AppShell({ children, dict }: { children: React.ReactNode, dict?: any }) {');
  fs.writeFileSync(appShellPath, content, 'utf-8');
  console.log('Fixed AppShell');
}

// SpotlightSearch.tsx
let ssPath = path.join(rootDir, 'src/components/layout/SpotlightSearch.tsx');
if (fs.existsSync(ssPath)) {
  let content = fs.readFileSync(ssPath, 'utf-8');
  // move TABS inside
  const tabsRegex = /const TABS = \[[\s\S]*?\];/;
  const match = content.match(tabsRegex);
  if (match) {
    content = content.replace(tabsRegex, '');
    content = content.replace('export function SpotlightSearch() {', `export function SpotlightSearch({ dict }: { dict?: any }) {\n  ${match[0]}\n`);
  } else {
    // If already moved but dict missing
    content = content.replace('export function SpotlightSearch() {', 'export function SpotlightSearch({ dict }: { dict?: any }) {');
  }
  fs.writeFileSync(ssPath, content, 'utf-8');
  console.log('Fixed SpotlightSearch');
}

// LeadsBoard.tsx
let lbPath = path.join(rootDir, 'src/components/leads/LeadsBoard.tsx');
if (fs.existsSync(lbPath)) {
  let content = fs.readFileSync(lbPath, 'utf-8');
  content = content.replace('export function LeadsBoard() {', 'export function LeadsBoard({ dict }: { dict?: any }) {');
  fs.writeFileSync(lbPath, content, 'utf-8');
  console.log('Fixed LeadsBoard');
}

// src/app/styles/page.tsx
let stylesPath = path.join(rootDir, 'src/app/styles/page.tsx');
if (fs.existsSync(stylesPath)) {
  let content = fs.readFileSync(stylesPath, 'utf-8');
  // Just revert dict.hardcoded calls in styles/page.tsx
  content = content.replace(/dict\.hardcoded\.[a-zA-Z0-9_]+/g, '"Style Placeholder"');
  fs.writeFileSync(stylesPath, content, 'utf-8');
  console.log('Fixed styles/page.tsx');
}
