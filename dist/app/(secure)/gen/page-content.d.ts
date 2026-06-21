import type { TemplateOption } from './types';
interface Option {
  value: string;
  label: string;
}
export interface Props {
  modules: Option[];
  subModules: Option[];
  templateOptions?: TemplateOption[];
}
export default function PageContent({
  modules,
  subModules,
  templateOptions: templateOptionsProp,
}: Props): import('react/jsx-runtime').JSX.Element;
export {};
//# sourceMappingURL=page-content.d.ts.map
