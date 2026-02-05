import { createBrowserClient } from '@supabase/ssr'

// Create a chainable mock query builder that behaves like a Promise
function createMockQueryBuilder() {
  const mockResult = { data: [], error: null }
  
  // Create a Promise that resolves to mockResult
  const promise = Promise.resolve(mockResult)
  
  // Create builder with all chainable methods
  const builder: any = {
    select: () => builder,
    insert: () => builder,
    update: () => builder,
    delete: () => builder,
    eq: () => builder,
    neq: () => builder,
    gt: () => builder,
    gte: () => builder,
    lt: () => builder,
    lte: () => builder,
    like: () => builder,
    ilike: () => builder,
    is: () => builder,
    in: () => builder,
    order: () => builder,
    limit: () => builder,
    single: () => promise,
    maybeSingle: () => promise,
    // Make the builder thenable (works with await)
    then: (onFulfilled: any, onRejected?: any) => promise.then(onFulfilled, onRejected),
    catch: (onRejected: any) => promise.catch(onRejected),
    finally: (onFinally: any) => promise.finally(onFinally),
  }
  return builder
}

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a mock client that won't break the app
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
        signUp: async () => ({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      from: () => createMockQueryBuilder(),
    } as any
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
