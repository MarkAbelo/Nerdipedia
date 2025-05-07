import React from "react";
import { NavLink } from "react-router-dom";
import nerdipedia_logo from "../assets/Nerdipedia_BGless.png"

function NavBar() {
    return (
        <nav className="bg-white border-gray-200 dark:bg-gray-900">
            <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                <NavLink to='/' className={"flex items-center space-x-3 rtl:space-x-reverse"}>
                    <img src={nerdipedia_logo} className="h-8" alt="nerdipedia_logo"/>
                </NavLink>
                <div className="hidden w-full md:block md:w-auto" id="navbar-default">
                <ul class="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
                    <li>
                        <NavLink to='/' className={"block py-2 px-3 text-white bg-blue-700 rounded-sm md:bg-transparent md:text-blue-700 md:p-0 dark:text-white md:dark:text-blue-500"}>Home</NavLink>
                    </li>
                    <li>
                        <NavLink to='/' className={"block py-2 px-3 text-white bg-blue-700 rounded-sm md:bg-transparent md:text-blue-700 md:p-0 dark:text-white md:dark:text-blue-500"}>Home</NavLink>
                    </li>
                    <li>
                        <NavLink to='/' className={"block py-2 px-3 text-white bg-blue-700 rounded-sm md:bg-transparent md:text-blue-700 md:p-0 dark:text-white md:dark:text-blue-500"}>Home</NavLink>
                    </li>
                    <li>
                        <NavLink to='/' className={"block py-2 px-3 text-white bg-blue-700 rounded-sm md:bg-transparent md:text-blue-700 md:p-0 dark:text-white md:dark:text-blue-500"}>Home</NavLink>
                    </li>
                    <li>
                        <NavLink to='/' className={"block py-2 px-3 text-white bg-blue-700 rounded-sm md:bg-transparent md:text-blue-700 md:p-0 dark:text-white md:dark:text-blue-500"}>Home</NavLink>
                    </li>
                </ul>
                </div>
            </div>
        </nav>
    )
}

export default NavBar
