import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import api from '../../utils/api'

export default function DesignerPage(){
  const router = useRouter();
  const { id } = router.query;
  const [designer, setDesigner] = useState(null);

  useEffect(()=>{
    if(!id) return;
    let mounted = true;
    api.getDesigner(id).then(d => { if(mounted) setDesigner(d); }).catch(()=>{});
    return ()=> mounted = false;
  },[id]);

  if(!designer) return <Layout><div>Loading designer...</div></Layout>
  return (
    <Layout>
      <div>
        <h2>{designer.name}</h2>
        <p>{designer.bio}</p>
      </div>
    </Layout>
  )
}
