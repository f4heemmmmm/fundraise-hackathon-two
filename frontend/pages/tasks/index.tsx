import Head from "next/head"
import Navbar from "@/components/navbar"

export default function Tasks() {
    return (
        <>
            <Head>
                <title>fundrAIse</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <main>
                <div className='min-h-screen min-w-full flex'>
                    <aside className='w-36 bg-gray-50 shadow-2xs p-6'>
                        <Navbar />
                    </aside>
                    <section className='flex-1 p-8'>
                        <div className="min-h-screen bg-background">
                            <div className=" mx-auto px-6 py-12">
                                <div className="mb-8">
                                    <h1 className="text-8xl font-semibold text-foreground mb-2 text-balance tracking-tighter">Tasks</h1>
                                    <p className="text-muted-foreground ml-4">Organise your day, your way</p>
                                </div>


                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </>
    )
}