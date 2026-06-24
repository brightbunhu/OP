'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProductStatus, PRODUCT_STATUSES } from '@/lib/product-constants';

interface CategoryOption {
  id: string;
  name: string;
}

interface ProductRow {
  id: string;
  name: string;
  slug: string;
  sku: string;
  barcode: string | null;
  description: string | null;
  imageUrl: string | null;
  categoryId: string;
  category: CategoryOption | null;
  price: string;
  compareAtPrice: string | null;
  costPrice: string | null;
  taxRate: string;
  weightGrams: number | null;
  status: ProductStatus;
  isFeatured: boolean;
}

const initialFormValues = {
  name: '',
  slug: '',
  sku: '',
  barcode: '',
  description: '',
  imageUrl: '',
  categoryId: '',
  price: '',
  compareAtPrice: '',
  costPrice: '',
  taxRate: '0.00',
  weightGrams: '',
  status: 'ACTIVE' as ProductStatus,
  isFeatured: false,
};

export default function AdminProductsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [isFeatured, setIsFeatured] = useState('');
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState({ ...initialFormValues });
  const [formMessage, setFormMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const activeFilters = useMemo(() => ({ search, status, featured: isFeatured }), [search, status, isFeatured]);

  useEffect(() => {
    void fetchCategories();
    void refreshProducts();
  }, []);

  async function fetchCategories() {
    const response = await fetch('/api/admin/categories');
    const data = await response.json();
    setCategories(data);
  }

  async function refreshProducts() {
    setLoading(true);

    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    if (isFeatured) params.set('featured', isFeatured);

    const response = await fetch(`/api/admin/products?${params.toString()}`);
    const data = await response.json();
    setProducts(data);
    setLoading(false);
  }

  function resetForm() {
    setSelectedProductId(null);
    setFormValues({ ...initialFormValues });
    setFormMessage('');
  }

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/admin/products/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        setFormMessage(`Upload failed: ${result.error}`);
        setUploadingImage(false);
        return;
      }

      setFormValues({ ...formValues, imageUrl: result.imageUrl });
      setFormMessage('Image uploaded successfully.');
    } catch (error) {
      setFormMessage('Upload error.');
      console.error(error);
    } finally {
      setUploadingImage(false);
    }
  }

  function handleEdit(product: ProductRow) {
    setSelectedProductId(product.id);
    setFormValues({
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      barcode: product.barcode ?? '',
      description: product.description ?? '',
      imageUrl: product.imageUrl ?? '',
      categoryId: product.categoryId,
      price: product.price,
      compareAtPrice: product.compareAtPrice ?? '',
      costPrice: product.costPrice ?? '',
      taxRate: product.taxRate,
      weightGrams: product.weightGrams !== null ? String(product.weightGrams) : '',
      status: product.status,
      isFeatured: product.isFeatured,
    });
    setFormMessage('Editing product');
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFormMessage('');

    const payload = {
      ...formValues,
      featured: formValues.isFeatured ? 'true' : 'false',
      price: formValues.price,
      compareAtPrice: formValues.compareAtPrice,
      costPrice: formValues.costPrice,
      taxRate: formValues.taxRate,
      weightGrams: formValues.weightGrams,
      categoryId: formValues.categoryId,
      status: formValues.status,
      id: selectedProductId,
    };

    const response = await fetch('/api/admin/products', {
      method: selectedProductId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      setFormMessage('Unable to save product. Please review the fields.');
      setSubmitting(false);
      return;
    }

    setFormMessage(selectedProductId ? 'Product updated successfully.' : 'Product created successfully.');
    setSubmitting(false);
    void refreshProducts();
    resetForm();
  }

  async function handleDelete(productId: string) {
    const confirmed = window.confirm('Delete this product? This action cannot be undone.');
    if (!confirmed) return;

    setSubmitting(true);
    const response = await fetch('/api/admin/products', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: productId }),
    });

    if (!response.ok) {
      setFormMessage('Unable to delete product.');
      setSubmitting(false);
      return;
    }

    setFormMessage('Product deleted successfully.');
    setSubmitting(false);
    void refreshProducts();
    if (selectedProductId === productId) resetForm();
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Product Management</p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">Manage catalog products</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Create, update, search, and delete products. All admin actions are backed by Prisma and PostgreSQL.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
          <section className="space-y-6 rounded-3xl border border-border bg-muted p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Product editor</p>
                <p className="text-sm text-muted-foreground">{selectedProductId ? 'Update an existing product' : 'Create a new product entry'}</p>
              </div>
              <Button onClick={resetForm} variant="secondary">
                New product
              </Button>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formValues.name}
                    onChange={(event) => setFormValues({ ...formValues, name: event.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formValues.slug}
                    onChange={(event) => setFormValues({ ...formValues, slug: event.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={formValues.sku}
                    onChange={(event) => setFormValues({ ...formValues, sku: event.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="barcode">Barcode</Label>
                  <Input id="barcode" value={formValues.barcode} onChange={(event) => setFormValues({ ...formValues, barcode: event.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={formValues.description}
                  onChange={(event) => setFormValues({ ...formValues, description: event.target.value })}
                  rows={4}
                  className="w-full rounded-md border bg-background px-3 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label>Product Image</Label>
                {formValues.imageUrl && (
                  <div className="mb-3 rounded-2xl bg-muted p-4">
                    <img src={formValues.imageUrl} alt="Preview" className="mx-auto max-h-48 rounded-lg object-contain" />
                  </div>
                )}
                <div className="flex gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="block flex-1 text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground hover:file:bg-primary/90 disabled:opacity-50"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Max 5MB. Supports JPG, PNG, GIF, WebP.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryId">Category</Label>
                <select
                  id="categoryId"
                  value={formValues.categoryId}
                  onChange={(event) => setFormValues({ ...formValues, categoryId: event.target.value })}
                  className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formValues.price}
                    onChange={(event) => setFormValues({ ...formValues, price: event.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="compareAtPrice">Compare at Price</Label>
                  <Input id="compareAtPrice" type="number" step="0.01" value={formValues.compareAtPrice} onChange={(event) => setFormValues({ ...formValues, compareAtPrice: event.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="costPrice">Cost Price</Label>
                  <Input id="costPrice" type="number" step="0.01" value={formValues.costPrice} onChange={(event) => setFormValues({ ...formValues, costPrice: event.target.value })} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="taxRate">Tax Rate</Label>
                  <Input id="taxRate" type="number" step="0.01" value={formValues.taxRate} onChange={(event) => setFormValues({ ...formValues, taxRate: event.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weightGrams">Weight (g)</Label>
                  <Input id="weightGrams" type="number" value={formValues.weightGrams} onChange={(event) => setFormValues({ ...formValues, weightGrams: event.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={formValues.status}
                    onChange={(event) => setFormValues({ ...formValues, status: event.target.value as ProductStatus })}
                    className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    {PRODUCT_STATUSES.map((statusOption) => (
                      <option key={statusOption} value={statusOption}>
                        {statusOption}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <input
                    id="isFeatured"
                    type="checkbox"
                    checked={formValues.isFeatured}
                    onChange={(event) => setFormValues({ ...formValues, isFeatured: event.target.checked })}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <Label htmlFor="isFeatured">Featured product</Label>
                </div>

                <div className="flex gap-3 flex-wrap">
                  {selectedProductId ? (
                    <Button type="button" variant="secondary" onClick={resetForm} disabled={submitting}>
                      Cancel edit
                    </Button>
                  ) : null}
                  <Button type="submit" disabled={submitting || uploadingImage}>
                    {submitting ? 'Saving…' : uploadingImage ? 'Uploading…' : selectedProductId ? 'Update product' : 'Create product'}
                  </Button>
                </div>
              </div>

              {formMessage ? <p className="text-sm text-muted-foreground">{formMessage}</p> : null}
            </form>
          </section>

          <section className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-3xl bg-muted p-4">
                <p className="text-sm font-semibold text-muted-foreground">Filters active</p>
                <p className="mt-2 text-sm text-foreground">{activeFilters.search || activeFilters.status || activeFilters.featured ? 'Applied' : 'None'}</p>
              </div>
              <div className="rounded-3xl bg-muted p-4">
                <p className="text-sm font-semibold text-muted-foreground">Products loaded</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{products.length}</p>
              </div>
              <div className="rounded-3xl bg-muted p-4">
                <p className="text-sm font-semibold text-muted-foreground">Categories</p>
                <p className="mt-2 text-sm text-foreground">{categories.length}</p>
              </div>
            </div>

            <div className="space-y-3 overflow-hidden rounded-3xl border border-border bg-background">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-foreground">Name</th>
                    <th className="px-4 py-3 font-semibold text-foreground">SKU</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Status</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                        {loading ? 'Loading products…' : 'No products found.'}
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product.id}>
                        <td className="px-4 py-3">{product.name}</td>
                        <td className="px-4 py-3">{product.sku}</td>
                        <td className="px-4 py-3">{product.status}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <Button variant="ghost" onClick={() => handleEdit(product)}>
                              Edit
                            </Button>
                            <Button variant="destructive" onClick={() => handleDelete(product.id)} disabled={submitting}>
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
