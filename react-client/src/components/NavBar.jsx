import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../contexts/authContext";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import nerdipedia_logo from "../assets/Nerdipedia_BGless.png";

function NavBar() {
    const { currentUser } = useAuth();

    const navigation = [
        { name: 'Home', href: '/home', current: true },
        { name: 'Books', href: '/books', current: false },
        { name: 'Shows', href: '/shows', current: false },
        { name: 'Movies', href: '/movies', current: false },
        { name: 'D&D', href: '/dnd', current: false }
    ]

    return (
        <nav className="bg-white border-gray-200 dark:bg-gray-900">
            <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                <NavLink to='/' className={"flex items-center space-x-3 rtl:space-x-reverse"}>
                    <img src={nerdipedia_logo} className="h-8" alt="nerdipedia_logo"/>
                </NavLink>
                <div className="hidden sm:ml-6 sm:block" id="navbar-default">
                    <div className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
                        {navigation.map( (navOpt) => (
                            <NavLink to={navOpt.href} className={navOpt.current? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium"}>
                                {navOpt.name}
                            </NavLink>
                        ))}
                        {currentUser? (
                        <li>
                            <NavLink to='/' className={"block py-2 px-3 text-white bg-blue-700 rounded-sm md:bg-transparent md:text-blue-700 md:p-0 dark:text-white md:dark:text-blue-500"}>Create Post</NavLink>
                        </li>
                        ) : null}

                    </div>
                </div>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            {currentUser? (
                <Menu as="div" className="relative ml-3">
                <div>
                    <MenuButton className="relative flex rounded-full bg-gray-800 text-sm focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden">
                    <span className="absolute -inset-1.5" />
                    <span className="sr-only">User Menu</span>
                    <img
                        alt="profile_picture"
                        src="/nouser.jpg"
                        className="size-8 rounded-full"
                    />
                    </MenuButton>
                </div>
                <MenuItems
                    transition
                    className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                >
                    <MenuItem>
                    <NavLink
                        NavLink="/account/1"
                        className={"block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden"}
                    >
                        Your Profile
                    </NavLink>
                    </MenuItem>
                    <MenuItem>
                    <NavLink
                        NavLink="/signout"
                        className={"block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden"}
                    >
                        Sign Out
                    </NavLink>
                    </MenuItem>
                </MenuItems>
                </Menu>
            ) : (
                <Menu as="div" className="relative ml-3">
                <div>
                    <MenuButton className="relative flex rounded-full bg-gray-800 text-sm focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden">
                    <span className="absolute -inset-1.5" />
                    <span className="sr-only">User Menu</span>
                    <img
                        alt="profile_picture"
                        src="/nouser.jpg"
                        className="size-8 rounded-full"
                    />
                    </MenuButton>
                </div>
                <MenuItems
                    transition
                    className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                >
                    <MenuItem>
                    <NavLink
                        to="/signin"
                        className={"block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden"}
                    >
                        Sign in
                    </NavLink>
                    </MenuItem>
                    <MenuItem>
                    <NavLink
                        to="/signup"
                        className={"block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden"}
                    >
                        Sign Up
                    </NavLink>
                    </MenuItem>
                </MenuItems>
                </Menu>
            )}
                
            </div>
        </nav>
    )
}

export default NavBar
