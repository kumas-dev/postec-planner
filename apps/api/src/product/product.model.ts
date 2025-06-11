export type ProductEntity = {
  id: string
  name: string
  specification: string
  initialsIndex: string
  isConsumable: boolean
  category: string
  item: string
  bundle?: {
    name: string
    quantity: number
  }
}
