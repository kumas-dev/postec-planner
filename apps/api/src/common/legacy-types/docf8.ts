import { PartnerEntity } from '@/partner'

export type DOCF8 = {
  buy_code: string
  buy_name: string
  buy_tel: string
  buy_tel1: string
  buy_addr: string
  buy_addr1: string
}

export function migrateDOCF8(data: DOCF8): PartnerEntity {
  const {
    buy_code: id,
    buy_name: name,
    buy_tel: primaryPhoneNumber,
    buy_tel1: secondaryPhoneNumber,
    buy_addr: primaryAddress,
    buy_addr1: secondaryAddress,
  } = data

  return {
    id,
    name,
    primaryPhoneNumber,
    secondaryPhoneNumber,
    primaryAddress,
    secondaryAddress,
    addressSortNumber: 0,
  }
}
