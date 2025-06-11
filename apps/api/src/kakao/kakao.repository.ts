import { KAKAO_REST_API_KEY } from '../config'
import { KaKaoAddressResponse } from '.'

async function findLocal(query: string): Promise<KaKaoAddressResponse[]> {
  if (!KAKAO_REST_API_KEY) {
    throw new Error('invalid KAKAO_REST_API_KEY')
  }

  const res = await fetch(
    `https://dapi.kakao.com/v2/local/search/address.json?query=${query}`,
    {
      headers: {
        Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
      },
    },
  )

  if (!res.ok) {
    if (res.status === 400) {
      const { documents } = await res.json()

      return documents
    }

    throw new Error(await res.text())
  }

  const { documents } = await res.json()

  return documents
}

export const kakaoRepository = {
  findLocal,
}
