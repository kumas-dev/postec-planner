import { ProductEntity, productRepository } from '.'

export async function findProductsByName(
  { name }: { name: string },
  { findProductsByName = productRepository.findProductsByName } = {},
): Promise<ProductEntity[]> {
  const products = await findProductsByName(name)

  return products
}
