const fs = require('fs');
const path = require('path');

const replacements = [
  {
    file: 'src/lib/api-client.ts',
    replace: [
      ['return dict.hardcoded.unknown_error;', 'return "Unknown error";']
    ]
  },
  {
    file: 'src/components/deals/AddLeadModal.tsx',
    replace: [
      ['export function AddLeadModal({ isOpen, onClose, onSuccess }: AddLeadModalProps) {', 'export function AddLeadModal({ isOpen, onClose, onSuccess, dict }: AddLeadModalProps & { dict: any }) {']
    ]
  },
  {
    file: 'src/components/deals/DealsClient.tsx',
    replace: [
      ['<AddLeadModal ', '<AddLeadModal dict={dict} ']
    ]
  },
  {
    file: 'src/components/deals/LeadChat.tsx',
    replace: [
      ['export function LeadChat({ dealId, brokerName }: { dealId: string, brokerName: string }) {', 'export function LeadChat({ dealId, brokerName, dict }: { dealId: string, brokerName: string, dict: any }) {'],
      ['export function LeadChat({ dealId, brokerName }: LeadChatProps) {', 'export function LeadChat({ dealId, brokerName, dict }: LeadChatProps & { dict: any }) {']
    ]
  },
  {
    file: 'src/components/deals/DealDetailClient.tsx',
    replace: [
      ['<LeadChat dealId={id} brokerName={deal.broker_name || \'\'} />', '<LeadChat dealId={id} brokerName={deal.broker_name || \'\'} dict={dict} />'],
      ['<LeadChat dealId={id as string} brokerName={deal.broker_name || \'\'} />', '<LeadChat dealId={id as string} brokerName={deal.broker_name || \'\'} dict={dict} />'],
      ['<LeadChat dealId={deal.id.toString()} brokerName={deal.broker_name || \'\'} />', '<LeadChat dealId={deal.id.toString()} brokerName={deal.broker_name || \'\'} dict={dict} />']
    ]
  },
  {
    file: 'src/components/layout/AppShell.tsx',
    replace: [
      ['export function AppShell({ children }: { children: React.ReactNode }) {', 'export function AppShell({ children, dict }: { children: React.ReactNode, dict: any }) {'],
      ['<Header />', '<Header dict={dict} />']
    ]
  },
  {
    file: 'src/app/[locale]/(protected)/layout.tsx',
    replace: [
      ['<AppShell>', '<AppShell dict={dict}>']
    ]
  },
  {
    file: 'src/components/layout/Header.tsx',
    replace: [
      ['export function Header() {', 'export function Header({ dict }: { dict: any }) {'],
      ['<SpotlightSearch />', '<SpotlightSearch dict={dict} />']
    ]
  },
  {
    file: 'src/components/layout/SpotlightSearch.tsx',
    replace: [
      ['export function SpotlightSearch() {', 'export function SpotlightSearch({ dict }: { dict: any }) {']
    ]
  },
  {
    file: 'src/components/leads/LeadDrawer.tsx',
    replace: [
      ['export function LeadDrawer({ leadId, isOpen, onClose }: LeadDrawerProps) {', 'export function LeadDrawer({ leadId, isOpen, onClose, dict }: LeadDrawerProps & { dict: any }) {']
    ]
  },
  {
    file: 'src/components/leads/LeadsBoard.tsx',
    replace: [
      ['export function LeadsBoard({ dict }: { dict: any }) {', 'export function LeadsBoard({ dict }: { dict: any }) {'],
      ['<LeadDrawer leadId={drawerLeadId} isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />', '<LeadDrawer leadId={drawerLeadId} isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} dict={dict} />']
    ]
  },
  {
    file: 'src/components/payouts/RequestPayoutModal.tsx',
    replace: [
      ['export function RequestPayoutModal({ isOpen, onClose, availableAmount }: RequestPayoutModalProps) {', 'export function RequestPayoutModal({ isOpen, onClose, availableAmount, dict }: RequestPayoutModalProps & { dict: any }) {']
    ]
  },
  {
    file: 'src/components/payouts/PayoutsClient.tsx',
    replace: [
      ['<RequestPayoutModal ', '<RequestPayoutModal dict={dict} ']
    ]
  },
  {
    file: 'src/components/support/CreateTicketModal.tsx',
    replace: [
      ['export function CreateTicketModal({ isOpen, onClose, onSuccess }: CreateTicketModalProps) {', 'export function CreateTicketModal({ isOpen, onClose, onSuccess, dict }: CreateTicketModalProps & { dict: any }) {']
    ]
  },
  {
    file: 'src/components/support/SupportClient.tsx',
    replace: [
      ['<CreateTicketModal ', '<CreateTicketModal dict={dict} ']
    ]
  }
];

const rootDir = '/Users/vytvytskyi/foryou_partners';

for (const rep of replacements) {
  const filePath = path.join(rootDir, rep.file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    for (const [from, to] of rep.replace) {
      if (!content.includes(from)) {
        // If exact match fails, it might be due to slight formatting differences, try regex
        if (from === 'export function LeadChat({ dealId, brokerName }: { dealId: string, brokerName: string }) {') {
           content = content.replace(/export function LeadChat\([^)]+\)\s*\{/, 'export function LeadChat({ dealId, brokerName, dict }: { dealId: string, brokerName: string, dict: any }) {');
        }
      }
      content = content.split(from).join(to);
    }
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('Fixed', rep.file);
  }
}
