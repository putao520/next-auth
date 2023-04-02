import { randomInt } from "crypto"
import type { InternalOptions } from "../../types"

function getToken(){
	let code = ""
	for(let i = 0; i < 6; i++){
		code += randomInt(1, 9)
	}
	return code
}

/**
 * Starts an e-mail login flow, by generating a token,
 * and sending it to the user's e-mail (with the help of a DB adapter)
 */
export default async function sms(
	identifier: string,
	options: InternalOptions<"sms">
): Promise<string> {
	const { url, adapter, provider, callbackUrl, theme } = options
	// Generate token
	const token = (await provider.generateVerificationToken?.()) ?? getToken()

	const ONE_DAY_IN_SECONDS = 300
	const expires = new Date(
		Date.now() + (provider.maxAge ?? ONE_DAY_IN_SECONDS) * 1000
	)

	// Generate a link with email, unhashed token and callback url
	const params = new URLSearchParams({ token, phoneNumber: identifier })
	const _url = `${url}/callback/${provider.id}?${params}`

	await Promise.all([
		// Send to user
		provider.sendVerificationRequest({
			phoneNumber: identifier,
			token,
			expires,
			url: _url,
			provider
		}),
		// Save in database
		adapter.createVerificationToken({
			identifier,
			token,
			expires,
		}),
	])

	return `${url}/verify-request?${new URLSearchParams({
		provider: provider.id,
		type: provider.type,
	})}`
}
