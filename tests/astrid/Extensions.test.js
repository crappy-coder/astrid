describe("Extensions", function() {
    describe("Window", function () {
        it("performance", function () {
            Should(window.performance).be.a.Object();
        });

        it("performance.now()", function () {
            Should(window.performance.now()).be.a.Number();
        });
    });

    describe("Array", function () {
        describe("contains()", function () {
            it("return true when item exists", function () {
                var arr = [1, 2, 3];

                Should(arr.contains(2)).be.true();
            });

            it("return false when item does not exist", function () {
                var arr = [1, 2, 3];

                Should(arr.contains(0)).be.false();
            });
        });

        describe("remove()", function () {
            it("remove an item by value", function () {
                var arr = [1, 2, 3];
                arr.remove(2);

                Should(arr).have.length(2);
                Should(arr[0]).be.equal(1);
                Should(arr[1]).be.equal(3);
            });

            it("not remove an item when the value does not exist", function () {
                var arr = [1, 2, 3];
                arr.remove(4);

                Should(arr).have.length(3);
                Should(arr[0]).be.equal(1);
                Should(arr[1]).be.equal(2);
                Should(arr[2]).be.equal(3);
            });
        });

        describe("removeAt()", function () {
            it("remove an item by index", function () {
                var arr = [1, 2, 3];
                arr.removeAt(1);

                Should(arr).have.length(2);
                Should(arr[0]).be.equal(1);
                Should(arr[1]).be.equal(3);
            });

            it("not remove an item when the index is out of range", function () {
                var arr = [1, 2, 3];
                arr.removeAt(4);

                Should(arr).have.length(3);
                Should(arr[0]).be.equal(1);
                Should(arr[1]).be.equal(2);
                Should(arr[2]).be.equal(3);
            });
        });
    });

    describe("Function", function () {
        describe("asDelegate", function () {
            it("return a function", function () {
                var func = function() {};

                Should(func.asDelegate(this)).be.a.Function();
            });

            it("returns the same function handler to each call", function () {
                var func = function() {};
                var f1 = func.asDelegate(this);
                var f2 = func.asDelegate(this);

                Should(f1).be.equal(f2);
            });

            it("returns the function when no context is passed", function () {
                var func = function() {};

                Should(func.asDelegate()).be.equal(func);
            });

            it("should equal the shorthand function d()", function () {
                var func = function() {};

                Should(func.asDelegate).be.equal(func.d);
            });
        });
    });

    describe("String", function () {
        describe("format", function () {
            it("return the same string when no format arguments are passed", function () {
                Should(String.format("My String")).be.a.String().and.be.equal("My String");
            });

            it("return the same string with an escaped format argument", function () {
                Should(String.format("My String %%")).be.a.String().and.be.equal("My String %");
            });

            it("return a string formatted to a string argument", function () {
                Should(String.format("My String %s", "B")).be.a.String().and.be.equal("My String B");
            });

            it("return a string formatted to a decimal argument", function () {
                Should(String.format("My String %d", 3.14)).be.a.String().and.be.equal("My String 3.14");
            });

            it("return a string formatted to a integer argument", function () {
                Should(String.format("My String %i", 3.14)).be.a.String().and.be.equal("My String 3");
            });

            it("return a string formatted to a hexidecimal value", function () {
                Should(String.format("My String %x", 255)).be.a.String().and.be.equal("My String 0xff");
            });

            it("return a string formatted to a hexidecimal value in uppercase", function () {
                Should(String.format("My String %X", 255)).be.a.String().and.be.equal("My String 0xFF");
            });

            it("return a string formatted to a json value", function () {
                Should(String.format("My String %j", {a: 1})).be.a.String().and.be.equal("My String {\"a\":1}");
            });
        });

        describe("contains", function () {
            it("return true when substring exists", function () {
                var str = "My String";

                Should(str.contains("My")).be.true();
            });

            it("return false when substring does not exist", function () {
                var str = "My String";

                Should(str.contains("Your")).be.false();
            });
        });
    });
});
