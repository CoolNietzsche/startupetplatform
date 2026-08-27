'use client'
import { useParams } from 'next/navigation'
import SignIn from './sign-in'
import SignUp from './sign-up'

export default function AuthPage() {
    const params = useParams();
    const slug = params?.slug;

    if (slug === 'sign-up' || slug === 'sign-up-builder') {
        return <SignUp />;
    }

    return <SignIn />;
}