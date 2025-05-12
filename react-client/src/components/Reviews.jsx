import React from "react";

function Reviews({reviews}){
    const formatUTCDate = (timestamp) => {
        const utcDate = new Date(timestamp);
        return utcDate.toLocaleString('en-GB', {
          timeZone: 'UTC',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          timeZoneName: 'short'
        }).replace(',', '');
      };

    if(typeof reviews !== 'object' && typeof reviews==='string'){
        return (
            <div className= "text-center text-gray-500 p-4 my-4 italic">
                {reviews}
            </div>
        )
    }
    else{
        return (
            <div className="space-y-4 p-4 bg-inherit rounded-lg shadow-inner">
                {reviews.map((review, index) => (
                    <div key={index} className="bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                        {/*This is the header section which includes all the meta data and the poster info*/}
                        <div className="flex justify-between items-start mb-2">
                        <div>
                            <p className="font-semibold text-blue-300">
                                {review.posterID}
                            </p>
                            <p className="text-sm text-blue-400 font-mono">
                            {formatUTCDate(review.timeStamp)}
                            </p>
                        </div>
                        {/*This is the body section which includes the review text*/}
                        <span  className="bg-amber-100 text-amber-800 text-sm font-medium px-2.5 py-1 rounded-full">⭐ {review.rating}/10</span>
                        </div>
                        <p className="text-white-700 leading-relaxed border-t border-amber-100 pt-3">
                            {review.body}
                        </p>
                    </div>
        ))}
            </div>
        )

    }
}
export default Reviews;