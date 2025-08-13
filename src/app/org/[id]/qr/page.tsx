import GenerateQr from "@/components/GenerateQr";

// This is the cleanest way to define the props for a Next.js page component.
// We let the framework's types handle the structure, and simply destructure
// the `params` you need. The `_searchParams` alias is a convention to tell the
// linter that you are intentionally not using that variable.
// This approach satisfies Next.js's internal `PageProps` type constraint.

interface Props {
  params: Promise<{ id: string }>;
}
export default async function OrgQR({ params} : Props) {
  const { id } = await params;
    return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">QR for Org: {id}</h1>
      <GenerateQr organizationId={id} />
    </div>
  );
}


// import GenerateQr from "@/components/GenerateQr";

// export default function OrgQR({
//   params,
//   searchParams,
// }: {
//   params: { id: string };
//   searchParams?: { [key: string]: string | string[] | undefined };
// }) {
//   return (
//     <div className="p-8">
//       <h1 className="text-2xl font-bold mb-4">QR for Org: {params.id}</h1>
//       <GenerateQr organizationId={params.id} />
//     </div>
//   );
// }

// import GenerateQr from '@/components/GenerateQr'
// interface Props {
//   params: { id: string };
// }

// export default function OrgQR({ params }: Props) {
//   const organizationId = params.id;

//   return (
//     <div className="p-8">
//       <h1 className="text-2xl font-bold mb-4">QR for Org: {organizationId}</h1>
//       <GenerateQr organizationId={organizationId} />
//     </div>
//   );
// }
