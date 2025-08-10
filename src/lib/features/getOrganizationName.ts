export const getOrganizationName = {
  async getOrganizationName(id: string) {
    const res = await fetch('/api/organizations',{
        method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
    
    })
    
    if (!res.ok) throw new Error("Failed to fetch organization");
    const data = await res.json();
    return data.organizationName;
  }
};