async function handleRequest(request) {
  const getVariant = await fetch('https://cfw-takehome.developers.workers.dev/api/variants', {
    headers: {
      'Content-Type': 'application/json',
      'method': 'GET',
    },
  })
  
  const init = {
    headers: {
      'Content-type': 'text/html;charset=UTF-8',
    },
  }
 
  const parsedResponse = await getVariant.json();
  
  const NAME = 'refactoring'
  
  const TEST_RESPONSE = parsedResponse.variants[0] // fetch('/test/1', request)
  const CONTROL_RESPONSE = parsedResponse.variants[1] // fetch('/control/2', request)
  // Determine which group this requester is in.
  const cookie = request.headers.get('cookie')
  if (cookie && cookie.includes(`${NAME}=control`)) {
    return CONTROL_RESPONSE;
  } else if (cookie && cookie.includes(`${NAME}=test`)) {
    return TEST_RESPONSE
  } else {
    // if no cookie then this is a new client, decide a group and set the cookie
    let group = Math.random() < 0.5 ? 'test' : 'control' // 50/50 split
    let response = group === 'control' ? CONTROL_RESPONSE : TEST_RESPONSE
    response.headers.append('Set-Cookie', `${NAME}=${group}; path=/`)
    const getURL = await fetch(response, init)
    const results = await gatherResponse(getURL)
    return new Response(results, init)
  }
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
/**
   * gatherResponse awaits and returns a response body as a string.
   * Use await gatherResponse(..) in an async function to get the response body
   * @param {Response} response
   */
  
async function gatherResponse(response) {
  const { headers } = response
  const contentType = headers.get('content-type')
  if(contentType.includes('application/json')) {
    return await response.json()
  } else if (contentType.includes('application/text')) {
    return await response.text()
  } else if (contentType.includes('text/html')) {
      return await response.text()
  } else {
    return await response.text()
  } 
}

