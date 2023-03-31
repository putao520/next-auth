import type { OAuthConfig, OAuthProvider, OAuthProviderType } from "./oauth"

import type { EmailConfig, EmailProvider, EmailProviderType } from "./email"

import type { SMSConfig, SMSProvider, SMSProviderType } from "./sms"

import type {
  CredentialsConfig,
  CredentialsProvider,
  CredentialsProviderType,
} from "./credentials"

export * from "./oauth"
export * from "./email"
export * from "./sms"
export * from "./credentials"

export type ProviderType = "oauth" | "email" | "credentials" | "sms"

export interface CommonProviderOptions {
  id: string
  name: string
  type: ProviderType
  options?: Record<string, unknown>
}

export type Provider = OAuthConfig<any> | EmailConfig | CredentialsConfig | SMSConfig

export type BuiltInProviders = Record<OAuthProviderType, OAuthProvider> &
  Record<CredentialsProviderType, CredentialsProvider> &
  Record<EmailProviderType, EmailProvider> &
  Record<SMSProviderType, SMSProvider>

export type AppProviders = Array<
  Provider | ReturnType<BuiltInProviders[keyof BuiltInProviders]>
>

export interface AppProvider extends CommonProviderOptions {
  signinUrl: string
  callbackUrl: string
}

export type RedirectableProviderType = "email" | "credentials" | "sms"

export type BuiltInProviderType = RedirectableProviderType | OAuthProviderType
