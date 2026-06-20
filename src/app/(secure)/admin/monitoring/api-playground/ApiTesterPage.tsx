import { ApiTesterContent } from './page-content';
import { ApiTesterProvider } from './context';
import PageShell from '@/components/core/page/page-shell';

export function ApiTesterPage() {
  return (
    <PageShell title="API Playground" noPadding enableShareUrl>
      <ApiTesterProvider>
        <ApiTesterContent />
      </ApiTesterProvider>
    </PageShell>
  );
}
