import type { CommonProviderOptions } from "."
import type { Awaitable } from ".."
import Dysmsapi20170525, * as $Dysmsapi20170525 from "@alicloud/dysmsapi20170525"
import * as $OpenApi from "@alicloud/openapi-client"

export interface SendSMSVerificationRequestParams {
	phoneNumber: string
	url: string
	expires: Date
	token?: string
	provider: SMSConfig
}

export interface SendSMSRequestParams extends SendSMSVerificationRequestParams {
	signName: string
}

export interface SMSConfig extends CommonProviderOptions {
	type: "sms"
	accessId: string
	accessKeySecret: string
	templateCode: string
	signName: string
	/**
	 * How long until the sms can be used to log the user in,
	 * in seconds. Defaults to 5 minutes
	 * @default 300
	 */
	maxAge?: number
	sendVerificationRequest: (
		params: SendSMSVerificationRequestParams
	) => Awaitable<void>
	generateVerificationToken?: () => Awaitable<string>
	secret?: string
	normalizeIdentifier?: (identifier: string) => string
	options: SMSUserConfig
}

export type SMSUserConfig = Partial<Omit<SMSConfig, "options">>

export type SMSProvider = (options: SMSUserConfig) => SMSConfig

export type SMSProviderType = "ali"

export default function SMS(options: SMSUserConfig): SMSConfig {
	return {
		id: "sms",
		type: "sms",
		name: "ali",
		accessId: "",
		accessKeySecret: "",
		templateCode: "",
		signName: "",
		maxAge: 5 * 60,
		async sendVerificationRequest(params) {
			const { provider } = params
			const token = params.token ?? (provider.generateVerificationToken ? provider.generateVerificationToken() : _generateVerificationToken())
			const client = createClient(provider.accessId, provider.accessKeySecret)
			const result = await client.sendSms(new $Dysmsapi20170525.SendSmsRequest({
				phoneNumbers: params.phoneNumber,
				signName: provider.signName,
				templateCode: provider.templateCode,
				templateParam: {"code": token},
			}))
			const failed = result.rejected.concat(result.pending).filter(Boolean)
			if (failed.length) {
				throw new Error(`SMS (${failed.join(", ")}) could not be sent`)
			}
		},
		options,
	}
}

/**
 * 使用AK&SK初始化账号Client
 * @param accessKeyId
 * @param accessKeySecret
 * @return Client
 * @throws Exception
 */
let global_client: Dysmsapi20170525 | null = null
function createClient(accessKeyId: string,accessKeySecret: string): Dysmsapi20170525 {
	if (global_client) {
		return global_client
	}

	let config = new $OpenApi.Config({
		accessKeyId: accessKeyId,
		accessKeySecret: accessKeySecret,
	})
	// 访问的域名
	config.endpoint = `dysmsapi.aliyuncs.com`
	global_client = new Dysmsapi20170525(config)
	return global_client
}

// 生成6位数字随机数
function _generateVerificationToken() {
	let code = ""
	for(let i =0; i < 6; i++){
		code += Math.round(Math.random() * 10).toString()
	}
	return code
}
