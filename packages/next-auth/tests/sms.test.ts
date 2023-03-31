import { createCSRF, handler, mockAdapter } from "./utils"
import SMSProvider from "../src/providers/sms"

it("Send sms to the only address correctly", async () => {
  const { secret, csrf } = await createCSRF()

  const sendVerificationRequest = jest.fn()
  const signIn = jest.fn(() => true)

  const phoneNumber = "00000000000"
  const { res } = await handler(
    {
      adapter: mockAdapter(),
      providers: [SMSProvider({ sendVerificationRequest })],
      callbacks: { signIn },
      secret,
      trustHost: true,
    },
    {
      path: "signin/sms",
      requestInit: {
        method: "POST",
        headers: { cookie: csrf.cookie, "content-type": "application/json" },
        body: JSON.stringify({ phoneNumber: phoneNumber, csrfToken: csrf.value }),
      },
    }
  )

  expect(res.redirect).toBe(
    "http://localhost:3000/api/auth/verify-request?provider=sms&type=sms"
  )

  expect(signIn).toBeCalledTimes(1)
  expect(signIn).toHaveBeenCalledWith(
    expect.objectContaining({
      user: expect.objectContaining({ phoneNumber }),
    })
  )

  expect(sendVerificationRequest).toHaveBeenCalledWith(
    expect.objectContaining({ identifier: phoneNumber })
  )
})

it("Redirect to error page if multiple addresses aren't allowed", async () => {
  const { secret, csrf } = await createCSRF()
  const sendVerificationRequest = jest.fn()
  const signIn = jest.fn()
  const error = new Error("Only one phoneNumber allowed")
  const { res, log } = await handler(
    {
      adapter: mockAdapter(),
      callbacks: { signIn },
      providers: [
        SMSProvider({
          sendVerificationRequest
        }),
      ],
      secret,
      trustHost: true,
    },
    {
      path: "signin/sms",
      requestInit: {
        method: "POST",
        headers: { cookie: csrf.cookie, "content-type": "application/json" },
        body: JSON.stringify({
          email: "00000000000,00000000001",
          csrfToken: csrf.value,
        }),
      },
    }
  )

  expect(signIn).toBeCalledTimes(0)
  expect(sendVerificationRequest).toBeCalledTimes(0)

  expect(log.error.mock.calls[0]).toEqual([
    "SIGNIN_SMS_ERROR",
    { error, providerId: "sms" },
  ])

  expect(res.redirect).toBe(
    "http://localhost:3000/api/auth/error?error=SMSSignin"
  )
})
