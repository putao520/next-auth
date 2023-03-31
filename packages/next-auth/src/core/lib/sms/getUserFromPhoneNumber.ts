import type { AdapterUser } from "../../../adapters"
import type { InternalOptions } from "../../types"

/**
 * Query the database for a user by email address.
 * If is an existing user return a user object (otherwise use placeholder).
 */
export default async function getAdapterUserFromPhoneNumber({
	phoneNumber,
	adapter,
}: {
	phoneNumber: string
	adapter: InternalOptions<"sms">["adapter"]
}): Promise<AdapterUser> {
	const { getUserByPhoneNumber } = adapter
	const adapterUser = phoneNumber ? await getUserByPhoneNumber(phoneNumber) : null
	if (adapterUser) return adapterUser

	return { id: phoneNumber, phoneNumber, smsVerified:null, email:"", emailVerified: null }
}
