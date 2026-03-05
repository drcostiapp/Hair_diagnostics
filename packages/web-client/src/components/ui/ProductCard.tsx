import type { Product } from 'shared-types'

interface ProductCardProps {
  product: Product
  reason?: string
}

export function ProductCard({ product, reason }: ProductCardProps) {
  return (
    <div className="bg-white rounded-xl shadow p-4 flex gap-4">
      {/* Product image placeholder */}
      <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
        <span className="text-2xl">🧴</span>
      </div>

      {/* Product info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 text-sm truncate">{product.name}</h3>
        <p className="text-xs text-gray-500">{product.brand}</p>
        {reason && (
          <p className="text-xs text-primary-600 mt-1">{reason}</p>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-semibold text-gray-900">
            ${product.priceUsd}
          </span>
          <a
            href={product.skinperfectionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary-500 font-medium hover:underline"
          >
            View on Skinperfection
          </a>
        </div>
      </div>
    </div>
  )
}
