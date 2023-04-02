import * as React from "react"
import { Theme } from "../.."
import { InternalUrl } from "../../utils/parse-url"

interface VerifyPageProps {
  phoneNumber: string
  url: InternalUrl
  theme: Theme
}

export default function VerifyPage(props: VerifyPageProps) {
  const { url, theme, phoneNumber } = props
  const [code, setCode] = React.useState('')
  const handleChange = (event) => {
	const data = event.target.value
    setCode(data)
	if( data.length === 6 ){
		// 长度符合验证码
	}
  }
  return (
    <div className="verify-request">
      {theme.brandColor && (
        <style
          dangerouslySetInnerHTML={{
            __html: `
        :root {
          --brand-color: ${theme.brandColor}
        }
      `,
          }}
        />
      )}
      <div className="card">
        {theme.logo && <img src={theme.logo} alt="Logo" className="logo" />}
        <h1>Check your SMS</h1>
		<h1>{phoneNumber}</h1>
        <p>
			<form action="">
				<input type="text" id='code' name='code' value={code} onChange={handleChange}/>
			</form>
			</p>
        <p>
          <a className="site" href={url.origin}>
            {url.host}
          </a>
        </p>
      </div>
    </div>
  )
}
