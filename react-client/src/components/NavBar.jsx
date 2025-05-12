import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/authContext";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import nerdipedia_logo from "../assets/Nerdipedia_BGless.png";

function NavBar() {
    const { currentUser } = useAuth();
    const location = useLocation();

    const navigation = [
        { name: 'Home', href: '/', current: true, needsUser: false},
        { name: 'Books', href: '/books', current: false, needsUser: false },
        { name: 'Shows', href: '/shows', current: false, needsUser: false },
        { name: 'Movies', href: '/movies', current: false, needsUser: false },
        { name: 'D&D', href: '/dnd', current: false, needsUser: false },
        { name: 'Create Post', href: '/createpost', current: false, needsUser: true}
    ]

    for (const i in navigation){
        navigation[i].current = (navigation[i].href === '/')?
            navigation[i].href === location.pathname :
            location.pathname.startsWith(navigation[i].href)
    }

    return (
        <nav className="bg-teal-600 border-gray-200 dark:bg-teal-800 relative flex h16 items-center absolute inset-y-0 left-0 w-full">
            <NavLink to='/' className={"flex items-center space-x-3 rtl:space-x-reverse ml-10"}>
                <img src={nerdipedia_logo} className="w-35 object-scale-down" alt="nerdipedia_logo"/>
            </NavLink>
            <div className="max-sm:hidden sm:max-w-screen-xl flex flex-wrap item-center left-0 p-0 my-0 mx-auto">
                <div className="hidden sm:ml-6 sm:block" id="navbar-default">
                    <div className="font-medium flex p-4 md:p-0 mt-4 md:flex-row md:space-x-10 rtl:space-x-reverse md:mt-0 ">
                        {navigation.map( (navOpt) => !navOpt.needsUser || currentUser? (
                            <NavLink key={`nav-${navOpt.name}`} to={navOpt.href} aria-current={navOpt.current ? 'page' : undefined} className={navOpt.current? "bg-teal-900 text-white text-lg rounded-md p-5" : "text-gray-300 hover:bg-teal-700 hover:text-white rounded-md p-5 text-md font-medium"}>
                                {navOpt.name}
                            </NavLink>
                        ) : null)}
                    </div>
                </div>
            </div>
            <div className="relative inset-y-0 flex items-center pr-2 sm:inset-auto justify-end m:pr-0">
            {currentUser? (
                <Menu as="div" className="relative ml-3">
                <div>
                    <MenuButton className="relative flex rounded-full bg-teal-900 text-sm focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden">
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
                    <MenuButton className="relative flex rounded-full text-sm focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden">
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
                        to="/login"
                        className={"block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden"}
                    >
                        Login
                    </NavLink>
                    </MenuItem>
                    <MenuItem>
                    <NavLink
                        to="/register"
                        className={"block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden"}
                    >
                        Register Account
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
