'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { api, type ProductType } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckIcon, ShieldIcon } from '@/components/icons';

interface Product {
  type: ProductType;
  id: string;
  name: string;
  price: number;
  credits: number;
  description: string;
  priceFormatted: string;
  perScanPrice: number;
  perScanFormatted: string;
}

function CreditCardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

function ProductCard({
  product,
  isPopular,
  isBestValue,
  onSelect,
  isLoading,
}: {
  product: Product;
  isPopular?: boolean;
  isBestValue?: boolean;
  onSelect: () => void;
  isLoading: boolean;
}) {
  const savings = product.type === 'SCAN_BUNDLE_5'
    ? '17%'
    : product.type === 'SCAN_BUNDLE_10'
    ? '33%'
    : null;

  return (
    <Card className={`relative border-slate-200/60 shadow-sm transition-all hover:shadow-md ${
      isPopular ? 'ring-2 ring-emerald-500 border-emerald-500' : ''
    } ${isBestValue ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-emerald-500 text-white px-3 py-1 text-xs font-semibold">
            POPULAR
          </Badge>
        </div>
      )}
      {isBestValue && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-blue-500 text-white px-3 py-1 text-xs font-semibold">
            BEST VALUE
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-2 pt-6">
        <CardTitle className="text-xl font-bold text-slate-900">{product.name}</CardTitle>
        <CardDescription className="text-slate-500">
          {product.credits} Scan{product.credits > 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>

      <CardContent className="text-center space-y-4">
        <div>
          <div className="text-4xl font-bold text-slate-900">{product.priceFormatted}</div>
          {product.credits > 1 && (
            <div className="text-sm text-slate-500 mt-1">
              {product.perScanFormatted}/scan
            </div>
          )}
          {savings && (
            <Badge variant="success" className="mt-2">
              Save {savings}
            </Badge>
          )}
        </div>

        <Button
          onClick={onSelect}
          disabled={isLoading}
          className={`w-full ${
            isPopular || isBestValue
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-slate-900 hover:bg-slate-800 text-white'
          }`}
        >
          {isLoading ? 'Processing...' : 'Buy Now'}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [credits, setCredits] = useState<{ totalCredits: number; usedCredits: number; availableCredits: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingProduct, setProcessingProduct] = useState<ProductType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [productsRes, creditsRes] = await Promise.all([
          api.getProducts(),
          api.getScanCredits(),
        ]);
        setProducts(productsRes.products);
        setCredits(creditsRes);
      } catch (err) {
        console.error('Failed to load checkout data:', err);
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    if (session) {
      loadData();
    }
  }, [session]);

  const handleSelectProduct = async (productType: ProductType) => {
    setProcessingProduct(productType);
    setError(null);

    try {
      const { paymentLink } = await api.createCheckoutSession(productType);
      // Redirect to Dodo Payments hosted checkout
      window.location.href = paymentLink;
    } catch (err) {
      console.error('Failed to create checkout session:', err);
      setError('Failed to start checkout. Please try again.');
      setProcessingProduct(null);
    }
  };

  if (sessionPending || loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <div className="h-8 w-48 bg-slate-200 rounded animate-pulse mx-auto" />
          <div className="h-4 w-64 bg-slate-100 rounded animate-pulse mx-auto mt-4" />
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="text-center">
                <div className="h-6 w-24 bg-slate-200 rounded mx-auto" />
                <div className="h-4 w-16 bg-slate-100 rounded mx-auto mt-2" />
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="h-10 w-20 bg-slate-200 rounded mx-auto" />
                <div className="h-10 w-full bg-slate-100 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Buy Scan Credits</h1>
        <p className="text-slate-500 mt-2">Choose a package that fits your needs</p>
      </div>

      {/* Current Balance */}
      {credits && (
        <Card className="border-slate-200/60 shadow-sm bg-gradient-to-r from-emerald-50 to-emerald-50/30">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <ShieldIcon className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <div className="font-semibold text-slate-900">Your Balance</div>
                <div className="text-sm text-slate-500">Available scan credits</div>
              </div>
            </div>
            <div className="text-3xl font-bold text-emerald-600">
              {credits.availableCredits}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Products Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.type}
            product={product}
            isPopular={product.type === 'SCAN_BUNDLE_5'}
            isBestValue={product.type === 'SCAN_BUNDLE_10'}
            onSelect={() => handleSelectProduct(product.type)}
            isLoading={processingProduct === product.type}
          />
        ))}
      </div>

      {/* Benefits */}
      <Card className="border-slate-200/60 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <SparklesIcon className="h-5 w-5 text-blue-600" />
            </div>
            <CardTitle className="text-lg">What&apos;s included in each scan</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              'GitHub repo analysis (Semgrep, npm audit, secrets)',
              'Live URL scanning (ZAP, headers, SSL)',
              'AI-powered explanations',
              'PDF report generation',
              'Shareable report link',
              'No expiration on credits',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <CheckIcon className="h-3 w-3 text-emerald-600" />
                </div>
                <span className="text-sm text-slate-600">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Secure Payment Badge */}
      <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
        <CreditCardIcon className="h-4 w-4" />
        <span>Secure checkout powered by Dodo Payments</span>
      </div>
    </div>
  );
}
