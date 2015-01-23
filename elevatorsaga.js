{
    init: function(elevators, floors) {
        var upRequests = [];
        var downRequests = [];
        
        var scheduleStop = function(elevator, floorNum) {
            elevator.goToFloor(floorNum);
            elevator.destinationQueue.sort();
            if (elevator.goingDownIndicator()) {
                elevator.destinationQueue.reverse();
            }
            elevator.checkDestinationQueue();
        };
        
        _.each(floors, function(floor) {
            floor.on("up_button_pressed", function() {
                upRequests.push(floor.level);
                upRequests.sort();
            }); 
            floor.on("down_button_pressed", function() {
                downRequests.push(floor.level);
                downRequests.sort();
                downRequests.reverse();
            }); 
        });
        _.each(elevators, function(elevator) {
            elevator.on("passing_floor", function(floorNum, direction) {
                if (elevator.loadFactor <= 0.25) {
                    if (direction == "up" && _.contains(upRequests, floorNum)) {
                        upRequests = _.without(upRequests, floorNum);
                        scheduleStop(elevator, floorNum);
                    }
                    if (direction == "down" && _.contains(downRequests, floorNum)) {
                        downRequests = _.without(downRequests, floorNum);
                        scheduleStop(elevator, floorNum);
                    }
                }
            });
            elevator.on("floor_button_pressed", function(floorNum) {
                if (elevator.goingUpIndicator() && floorNum > elevator.currentFloor() ||elevator.goingDownIndicator() && floorNum < elevator.currentFloor()) {
                    scheduleStop(elevator, floorNum);
                }
            });
            elevator.on("idle", function() {
                if (upRequests.length == 0 && downRequests.length == 0) {
                    elevator.goToFloor(0);
                } else {
                    if (elevator.currentFloor() <= _.first(upRequests)) {
                        elevator.destinationQueue = upRequests;
                        upRequests = [];
                    } else if (elevator.currentFloor() >= _.first(downRequests)){
                        elevator.destinationQueue = downRequests;
                        downRequests = [];
                    } else if (upRequests.length > downRequests.length) {
                        elevator.destinationQueue = upRequests;
                        upRequests = [];
                    } else {
                        elevator.destinationQueue = downRequests;
                        downRequests = [];
                    }
                    elevator.checkDestinationQueue();
                }
            });
        });
    },
    update: function(dt, elevators, floors) {
    }
}
