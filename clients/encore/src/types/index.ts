export {
  FailureCategory,
  type NetworkFailure,
  type ConsoleEntry,
  type AuthChainEntry,
  type DiagnosticSnapshot,
} from './diagnostics';

export interface IConfig {
  browser: string;
  url: string;
  base_url: string;
  home_url: string;
  username_automation: string;
  password_automation: string;
  mfa_secret?: string;
  [key: string]: string | undefined;
}

export interface IValidationFields {
  [fieldKey: string]: string;
}
