import ResetPasswordForm from './reset-form';

export function generateStaticParams() {
  return [{ token: "PLACEHOLDER" }];
}

export default function ResetPasswordPage({
  params,
}: {
  params: { token: string };
}) {
  return <ResetPasswordForm token={params.token} />;
}