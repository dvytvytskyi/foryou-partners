const fs = require('fs');
const path = require('path');

const filesToFix = [
  {
    path: 'src/components/admin/UserModal.tsx',
    regexes: [
      [/export function UserModal\(\{\s*user,\s*onClose,\s*onUpdated\s*\}\s*:\s*UserModalProps\)\s*\{/g, 'export function UserModal({ user, onClose, onUpdated, dict }: UserModalProps & { dict?: any }) {']
    ]
  },
  {
    path: 'src/components/admin/UserTicketsSubModal.tsx',
    regexes: [
      [/export function UserTicketsSubModal\(\{\s*userId,\s*onClose\s*\}\s*:\s*UserTicketsSubModalProps\)\s*\{/g, 'export function UserTicketsSubModal({ userId, onClose, dict }: UserTicketsSubModalProps & { dict?: any }) {']
    ]
  },
  {
    path: 'src/components/deals/LeadChat.tsx',
    regexes: [
      [/export function LeadChat\(\{\s*dealId,\s*brokerName\s*\}\s*:\s*LeadChatProps\)\s*\{/g, 'export function LeadChat({ dealId, brokerName, dict }: LeadChatProps & { dict?: any }) {']
    ]
  },
  {
    path: 'src/components/layout/AppShell.tsx',
    regexes: [
      [/export function AppShell\(\{\s*children\s*\}\s*:\s*\{\s*children:\s*React\.ReactNode\s*\}\)\s*\{/g, 'export function AppShell({ children, dict }: { children: React.ReactNode, dict?: any }) {']
    ]
  },
  {
    path: 'src/components/layout/SpotlightSearch.tsx',
    regexes: [
      [/export function SpotlightSearch\(\)\s*\{/g, 'export function SpotlightSearch({ dict }: { dict?: any }) {']
    ]
  },
  {
    path: 'src/components/leads/LeadDrawer.tsx',
    regexes: [
      [/export function LeadDrawer\(\{\s*leadId,\s*isOpen,\s*onClose\s*\}\s*:\s*LeadDrawerProps\)\s*\{/g, 'export function LeadDrawer({ leadId, isOpen, onClose, dict }: LeadDrawerProps & { dict?: any }) {']
    ]
  },
  {
    path: 'src/components/leads/LeadsBoard.tsx',
    regexes: [
      // wait, LeadsBoard threw TS2304? Line 18
      [/export function LeadsBoard\(\{\s*dict\s*\}\s*:\s*\{\s*dict:\s*any\s*\}\)\s*\{/g, 'export function LeadsBoard({ dict }: { dict?: any }) {'] // maybe it already has dict, let's check
    ]
  },
  {
    path: 'src/components/payouts/RequestPayoutModal.tsx',
    regexes: [
      [/export function RequestPayoutModal\(\{\s*isOpen,\s*onClose,\s*availableAmount\s*\}\s*:\s*RequestPayoutModalProps\)\s*\{/g, 'export function RequestPayoutModal({ isOpen, onClose, availableAmount, dict }: RequestPayoutModalProps & { dict?: any }) {']
    ]
  },
  {
    path: 'src/components/support/CreateTicketModal.tsx',
    regexes: [
      [/export function CreateTicketModal\(\{\s*isOpen,\s*onClose,\s*onSuccess\s*\}\s*:\s*CreateTicketModalProps\)\s*\{/g, 'export function CreateTicketModal({ isOpen, onClose, onSuccess, dict }: CreateTicketModalProps & { dict?: any }) {']
    ]
  }
];

const rootDir = '/Users/vytvytskyi/foryou_partners';

for (const { path: relPath, regexes } of filesToFix) {
  const filePath = path.join(rootDir, relPath);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    for (const [regex, replacement] of regexes) {
      content = content.replace(regex, replacement);
    }
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('Fixed', relPath);
  }
}
