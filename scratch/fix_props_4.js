const fs = require('fs');
const path = require('path');

const rootDir = '/Users/vytvytskyi/foryou_partners';

const filesToFix = [
  {
    path: 'src/components/admin/UserModal.tsx',
    replace: [
      ['export function UserModal({ user, onClose, onStatusChange }: UserModalProps)', 'export function UserModal({ user, onClose, onStatusChange, dict }: UserModalProps & { dict?: any })']
    ]
  },
  {
    path: 'src/components/admin/UserTicketsSubModal.tsx',
    replace: [
      ['export function UserTicketsSubModal({ userId, onClose }: UserTicketsSubModalProps)', 'export function UserTicketsSubModal({ userId, onClose, dict }: UserTicketsSubModalProps & { dict?: any })']
    ]
  },
  {
    path: 'src/components/deals/LeadChat.tsx',
    replace: [
      ['export function LeadChat({ dealId, brokerName }: LeadChatProps)', 'export function LeadChat({ dealId, brokerName, dict }: LeadChatProps & { dict?: any })']
    ]
  },
  {
    path: 'src/components/layout/AppShell.tsx',
    replace: [
      ['export function AppShell({ children }: { children: React.ReactNode }) {', 'export function AppShell({ children, dict }: { children: React.ReactNode, dict?: any }) {']
    ]
  },
  {
    path: 'src/components/layout/SpotlightSearch.tsx',
    replace: [
      ['export function SpotlightSearch() {', 'export function SpotlightSearch({ dict }: { dict?: any }) {'],
      ['const TABS = [', '/* moved TABS inside component */']
    ]
  },
  {
    path: 'src/components/leads/LeadDrawer.tsx',
    replace: [
      ['export function LeadDrawer({ leadId, isOpen, onClose }: LeadDrawerProps)', 'export function LeadDrawer({ leadId, isOpen, onClose, dict }: LeadDrawerProps & { dict?: any })']
    ]
  },
  {
    path: 'src/components/leads/LeadsBoard.tsx',
    replace: [
      ['export function LeadsBoard() {', 'export function LeadsBoard({ dict }: { dict?: any }) {']
    ]
  },
  {
    path: 'src/components/payouts/RequestPayoutModal.tsx',
    replace: [
      ['export function RequestPayoutModal({ isOpen, onClose, onSuccess, maxAmount }: RequestPayoutModalProps)', 'export function RequestPayoutModal({ isOpen, onClose, onSuccess, maxAmount, dict }: RequestPayoutModalProps & { dict?: any })']
    ]
  },
  {
    path: 'src/components/support/CreateTicketModal.tsx',
    replace: [
      ['export function CreateTicketModal({ isOpen, onClose, onSuccess }: CreateTicketModalProps)', 'export function CreateTicketModal({ isOpen, onClose, onSuccess, dict }: CreateTicketModalProps & { dict?: any })']
    ]
  }
];

for (const { path: relPath, replace } of filesToFix) {
  const filePath = path.join(rootDir, relPath);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    for (const [from, to] of replace) {
      content = content.replace(from, to);
    }
    
    if (relPath === 'src/components/layout/SpotlightSearch.tsx') {
      // Need to move TABS inside the component
      const tabsRegex = /const TABS = \[[\s\S]*?\];/;
      const match = content.match(tabsRegex);
      if (match) {
        content = content.replace(tabsRegex, '');
        content = content.replace('export function SpotlightSearch({ dict }: { dict?: any }) {', `export function SpotlightSearch({ dict }: { dict?: any }) {\n  ${match[0]}\n`);
      }
    }
    
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('Fixed', relPath);
  }
}
