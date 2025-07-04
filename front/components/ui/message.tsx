import { Check, CircleAlert, CircleCheck } from "lucide-react";

export default function Message({ error, success }: { error: string | null, success: string | null }) {
    return (
        <div className="fadeIn">
            {error && <div className='bg-red-500 py-2 px-4 rounded-md border-1 border-red-500 flex-row flex justify-between'>
                <p className="text-white">{error}</p>
                <CircleAlert size={24} className='text-white' />
            </div>}
            {success && <div className='bg-green-500 py-2 px-4 rounded-md border-1 border-green-500 flex-row flex justify-between'>
                <p className="text-white">{success}</p>
                <CircleCheck size={24} className='text-white' />
            </div>}
        </div>
    )
}