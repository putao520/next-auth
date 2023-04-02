// eslint-disable-next-line no-use-before-define
import * as React from "react"
import { signIn, signOut, useSession } from "next-auth/react"
import Layout from "components/layout"

export default function Page() {
  const [response, setResponse] = React.useState(null)
  const [phoneNumber, setPhoneNumber] = React.useState("")

  const handleChange = (event) => {
    setPhoneNumber(event.target.value)
  }

  const handleLogin = (options) => async (event) => {
    event.preventDefault()
    if (options.redirect) {
      return signIn("sms", options)
    }

    const response = await signIn("sms", options)
    setResponse(response)
  }

  const handleLogout = (options) => async (event) => {
    if (options.redirect) {
      return signOut(options)
    }
    const response = await signOut(options)
    setResponse(response)
  }

  const { data: session } = useSession()

  if (session) {
    return (
      <Layout>
        <h1>Test different flows for SMS logout</h1>
        <span className="spacing">Default:</span>
        <button onClick={handleLogout({ redirect: true })}>Logout</button>
        <br />
        <span className="spacing">No redirect:</span>
        <button onClick={handleLogout({ redirect: false })}>Logout</button>
        <br />
        <p>Response:</p>
        <pre style={{ background: "#eee", padding: 16 }}>
          {JSON.stringify(response, null, 2)}
        </pre>
      </Layout>
    )
  }

  return (
    <Layout>
      <h1>Test different flows for Phone Number login</h1>
      <label className="spacing">
        Phone Number:{" "}
        <input
          type="text"
          id="phoneNumber"
          name="phoneNumber"
          value={phoneNumber}
          onChange={handleChange}
        />
      </label>
      <br />
      <form onSubmit={handleLogin({ redirect: true, phoneNumber })}>
        <span className="spacing">Default:</span>
        <button type="submit">Sign in with SMS</button>
      </form>
      <form onSubmit={handleLogin({ redirect: false, phoneNumber })}>
        <span className="spacing">No redirect:</span>
        <button type="submit">Sign in with SMS</button>
      </form>
      <p>Response:</p>
      <pre style={{ background: "#eee", padding: 16 }}>
        {JSON.stringify(response, null, 2)}
      </pre>
    </Layout>
  )
}
