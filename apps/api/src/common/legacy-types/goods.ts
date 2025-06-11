import { ProductEntity } from '@/product'

export type Goods = {
  Code: string
  Goods: string
  Stand: string
  Cho: string
  Supplier: number
  S_ea: number
  Danw: string
  Class_TopX: string
  Class_MidX: string
}

export function migrateProduct(product: Goods): ProductEntity {
  const {
    Code: id,
    Goods: name,
    Cho: initialsIndex,
    Stand: specification,
    Supplier: consumable,
    S_ea: bundleQuantity,
    Danw: bundleName,
    Class_TopX: category,
    Class_MidX: item,
  } = product

  return {
    id,
    initialsIndex,
    name,
    specification,
    category,
    item,
    isConsumable: consumable === 1,
    ...(!!bundleName &&
      bundleQuantity > 1 && {
        bundle: {
          name: bundleName,
          quantity: bundleQuantity,
        },
      }),
  }
}
