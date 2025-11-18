import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import api from '../../utils/api'

export default function ProductPage(){
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);

  useEffect(()=>{
    if(!id) return;
    let mounted = true;
    api.getProduct(id).then(p => { if(mounted) setProduct(p); }).catch(()=>{});
    return ()=> mounted = false;
  },[id]);

  if(!product) return <Layout><div>Loading product...</div></Layout>
  return (
    <Layout>
      <div>
        <h2>{product.title}</h2>
        <p>{product.description}</p>
        <p><strong>Price:</strong> {(product.priceCents/100).toFixed(2)} {product.currency}</p>
      </div>
    </Layout>
  )
}
