/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 - present Instructure, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import React from 'react'

import { theme } from '@instructure/canvas-theme'
import { LtiTokenRetriever } from '@oxctl/ui-lti'
import { Spinner } from '@instructure/ui-spinner'
import { ErrorBillBoard } from '@oxctl/ui-lti'
import { LtiApplyTheme } from '@oxctl/ui-lti'
import jwtDecode from 'jwt-decode'
import { LtiHeightLimit } from '@oxctl/ui-lti'

import '@instructure/canvas-theme'

const settings = {
  'https://localhost:3000': {
    'ltiServer': process.env.REACT_APP_LTI_URL,
    'proxyServer': process.env.REACT_APP_PROXY_URL
  },
  'https://oxctl-canvas-calendar-sync-dev.s3-eu-west-1.amazonaws.com': {
    'ltiServer': 'https://lti-dev.canvas.ox.ac.uk',
    'proxyServer': 'https://proxy-dev.canvas.ox.ac.uk'
  },
  'https://oxctl-canvas-calendar-sync-prod.s3-eu-west-1.amazonaws.com': {
    'ltiServer': 'https://lti.canvas.ox.ac.uk',
    'proxyServer': 'https://proxy.canvas.ox.ac.uk'
  }
}



// Needed to prevent optimising away of theme.
//theme.use()

class App extends React.Component {
  state = {
    jwt: null,
    needsToken: false,
    error: null,
    comInstructureBrandConfigJsonUrl: null,
    canvasApiBaseUrl: null
  }

  constructor(props, context) {
    super(props, context)
    const origin = window.origin
    const server = settings[origin]
    if (server) {
      this.proxyUrl = server.proxyServer
      this.ltiUrl = server.ltiServer
    } else {
      this.state['error'] = 'Failed to find settings for origin: ' + origin
    }
  }

  updateToken(token) {
    this.jwt = jwtDecode(token)
    this.setState({
      jwt: token,
      comInstructureBrandConfigJsonUrl: this.jwt['https://purl.imsglobal.org/spec/lti/claim/custom'].com_instructure_brand_config_json_url,
      canvasApiBaseUrl: this.jwt['https://purl.imsglobal.org/spec/lti/claim/custom'].canvas_api_base_url
    })
  }

  render() {
    return (
      <ErrorBillBoard message={this.state.error}>
        <LtiTokenRetriever ltiServer={this.ltiUrl} handleJwt={(jwt) => this.updateToken(jwt)}>
          <LtiApplyTheme url={this.state.comInstructureBrandConfigJsonUrl}>
            <LtiHeightLimit>
                <Spinner renderTitle="Loading JWT" size={'medium'}/>
                Hello Im me
            </LtiHeightLimit>
          </LtiApplyTheme>
        </LtiTokenRetriever>
      </ErrorBillBoard>
    )
  }
}

export default App
