import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import JitsiRoom  from '@/components/meetings/MeetingRoom';

export default async function MeetingPage({ params }: { params: Promise<{ roomName: string }> }) {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/login');
  }

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-4 italic">Live Classroom: {(await params).roomName}</h1>
      <JitsiRoom 
        roomName={(await params).roomName} 
        userName={session.user.name || "Student"} 
        userEmail={session.user.email || ""}
      />
    </div>
  );
}