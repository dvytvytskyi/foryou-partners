const fs = require('fs');
const path = require('path');

const rootDir = '/Users/vytvytskyi/foryou_partners';

const replacements = [
  {
    file: 'src/components/admin/UserModal.tsx',
    replace: [
      ['export function UserModal({ user, onClose, onUpdated }: UserModalProps)', 'export function UserModal({ user, onClose, onUpdated, dict }: UserModalProps & { dict: any })']
    ]
  },
  {
    file: 'src/components/admin/PartnersClient.tsx',
    replace: [
      ['<UserModal ', '<UserModal dict={dict} ']
    ]
  },
  {
    file: 'src/components/admin/UserTicketsSubModal.tsx',
    replace: [
      ['export function UserTicketsSubModal({ userId, onClose }: UserTicketsSubModalProps)', 'export function UserTicketsSubModal({ userId, onClose, dict }: UserTicketsSubModalProps & { dict: any })']
    ]
  },
  {
    file: 'src/components/deals/DealsTable.tsx',
    replace: [
      ['function getStatusBadgeType(statusName: string) {', 'function getStatusBadgeType(statusName: string, dict?: any) {'],
      ['if (lower.includes(dict.hardcoded.successfully_realized) || lower.includes(dict.hardcoded.successfully_realized))', 'if (lower.includes("успешно") || lower.includes("реализовано"))'],
      ['if (lower.includes(dict.hardcoded.hc_53) || lower.includes(dict.hardcoded.hc_53) || lower.includes(dict.hardcoded.archive))', 'if (lower.includes("отказ") || lower.includes("архив"))'],
      ['if (lower.includes(dict.hardcoded.contact) || lower.includes(dict.hardcoded.hc_56) || lower.includes(dict.hardcoded.hc_57))', 'if (lower.includes("контакт") || lower.includes("переговор") || lower.includes("презентац"))'],
      ['const badgeType = getStatusBadgeType(statusLabel);', 'const badgeType = getStatusBadgeType(statusLabel, dict);']
    ]
  },
  {
    file: 'src/components/deals/LeadChat.tsx',
    replace: [
      ['const submitComment = async (e: React.FormEvent) => {', 'const submitComment = async (e: React.FormEvent, dict: any) => {'],
      ['onSubmit={submitComment}', 'onSubmit={(e) => submitComment(e, dict)}'],
      ['return dict.hardcoded.failed_to_send_message_to_amoc;', 'return "Failed to send message to AmoCRM";'],
      ['setError(dict.hardcoded.failed_to_send_message);', 'setError("Failed to send message");'],
      ['placeholder={dict.hardcoded.type_a_message}', 'placeholder="Type a message..."'],
      ['placeholder={dict.hardcoded.write_a_comment}', 'placeholder="Write a comment..."']
    ]
  }
];

for (const rep of replacements) {
  const filePath = path.join(rootDir, rep.file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    for (const [from, to] of rep.replace) {
      content = content.split(from).join(to);
    }
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('Fixed', rep.file);
  }
}
