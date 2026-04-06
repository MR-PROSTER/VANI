import { Search, Bell, HatGlasses } from 'lucide-react'
import { InputGroupDemo } from './Searchbar'
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'

const Navbar = () => {
    return (
        <div>
            <nav className='h-16 w-full flex items-center justify-center'>
                <div className='w-full h-full p-3'>
                    {/* <div className='w-1/2 h-full rounded-2xl flex items-center bg-[#080708] border border-[#19171a]'>
                        <Search size={18} className='text-white m-4' />
                        <h3 className='font-medium text-gray-500'>search or press ctrl + k</h3>
                    </div> */}
                    <InputGroupDemo />
                </div>
                <div className='w-full h-full flex items-center justify-end'>
                    <div className="border w-fit rounded-full mx-4 ">
                        <Bell size={18} className="text-white m-2" />
                    </div>
                    {/* <div className='border w-fit rounded-full mx-4 bg-white'>
                        <HatGlasses size={18} className='text-black m-2' />
                    </div> */}
                    <div>
                        <Show when="signed-out">
                            <SignInButton />
                            <SignUpButton />
                            {/* <button className="bg-purple-700 text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                                    Sign Up
                                </button>
                            </SignUpButton> */}
                        </Show>
                        <Show when="signed-in">
                            <UserButton />
                        </Show>
                    </div>
                </div>
            </nav>
        </div>
    )
}

export default Navbar
