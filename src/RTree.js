import { ValueOrDefault } from "./Engine";

class RTree {
	constructor(size) {
		this.minWidth = size == null ? 3 : Math.floor(size * 0.5);
		this.maxWidth = ValueOrDefault(size, 6);

		this._T = {x: 0, y: 0, w: 0, h: 0, id: "root", nodes: []};
	}

	getRoot() {
		return this._T;
	}

	overlapRectangle(a, b) {
		return (a.x < (b.x + b.w) && (a.x + a.w) > b.x && a.y < (b.y + b.h) && (a.y + a.h) > b.y);
	}

	containsRectangle(a, b) {
		return ((a.x + a.w) <= (b.x + b.w) && a.x >= b.x && (a.y + a.h) <= (b.y + b.h) && a.y >= b.y);
	}

	expandRectangle(a, b) {
		var nx = Math.min(a.x, b.x);
		var ny = Math.min(a.y, b.y);
		a.w = Math.max(a.x + a.w, b.x + b.w) - nx;
		a.h = Math.max(a.y + a.h, b.y + b.h) - ny;
		a.x = nx;
		a.y = ny;
		return (a);
	}

	isArray(o) {
		return Object.prototype.toString.call(o) === '[object Array]';
	}

	MBR(nodes, rect) {
		if (nodes.length < 1) {
			return ({x: 0, y: 0, w: 0, h: 0});
		}
		//throw "make_MBR: nodes must contain at least one rectangle!";
		if (!rect) {
			rect = {x: nodes[0].x, y: nodes[0].y, w: nodes[0].w, h: nodes[0].h};
		}
		else {
			rect.x = nodes[0].x;
		}
		rect.y = nodes[0].y;
		rect.w = nodes[0].w;
		rect.h = nodes[0].h;

		for (var i = nodes.length - 1; i > 0; i--) {
			this.expandRectangle(rect, nodes[i]);
		}

		return (rect);
	}

	squarifiedRatio(l, w, fill) {
		// Area of new enlarged rectangle
		var lperi = (l + w) / 2.0; // Average size of a side of the new rectangle
		var larea = l * w; // Area of new rectangle
		// return the ratio of the perimeter to the area - the closer to 1 we are,
		// the more "square" a rectangle is. conversely, when approaching zero the
		// more elongated a rectangle is
		var lgeo = larea / (lperi * lperi);
		return (larea * fill / lgeo);
	}

	removeSubtree(rect, obj, root) {
		var hit_stack = []; // Contains the elements that overlap
		var count_stack = []; // Contains the elements that overlap
		var ret_array = [];
		var current_depth = 1;

		if (!rect || !this.overlapRectangle(rect, root)) {
			return ret_array;
		}

		var ret_obj = {x: rect.x, y: rect.y, w: rect.w, h: rect.h, target: obj};

		count_stack.push(root.nodes.length);
		hit_stack.push(root);

		do {
			var tree = hit_stack.pop();
			var i = count_stack.pop() - 1;

			if ("target" in ret_obj) { // We are searching for a target
				while (i >= 0) {
					var ltree = tree.nodes[i];
					if (this.overlapRectangle(ret_obj, ltree)) {
						if ((ret_obj.target && "leaf" in ltree && ltree.leaf === ret_obj.target)
								|| (!ret_obj.target && ("leaf" in ltree || this.containsRectangle(ltree, ret_obj)))) { // A Match !!
							// Yup we found a match...
							// we can cancel search and start walking up the list
							if ("nodes" in ltree) {// If we are deleting a node not a leaf...
								ret_array = this.searchSubtree(ltree, true, [], ltree);
								tree.nodes.splice(i, 1);
							}
							else {
								ret_array = tree.nodes.splice(i, 1);
							}
							// Resize MBR down...
							this.MBR(tree.nodes, tree);
							delete ret_obj.target;
							if (tree.nodes.length < this.minWidth) { // Underflow
								ret_obj.nodes = this.searchSubtree(tree, true, [], tree);
							}
							break;
						}/*	else if("load" in ltree) { // A load
						 }*/
						else if ("nodes" in ltree) { // Not a Leaf
							current_depth += 1;
							count_stack.push(i);
							hit_stack.push(tree);
							tree = ltree;
							i = ltree.nodes.length;
						}
					}
					i -= 1;
				}
			}
			else if ("nodes" in ret_obj) { // We are unsplitting
				tree.nodes.splice(i + 1, 1); // Remove unsplit node
				// ret_obj.nodes contains a list of elements removed from the tree so far
				if (tree.nodes.length > 0) {
					this.MBR(tree.nodes, tree);
				}
				for (var t = 0; t < ret_obj.nodes.length; t++) {
					this.insertSubtree(ret_obj.nodes[t], tree);
				}
				ret_obj.nodes.length = 0;
				if (hit_stack.length == 0 && tree.nodes.length <= 1) { // Underflow..on root!
					ret_obj.nodes = this.searchSubtree(tree, true, ret_obj.nodes, tree);
					tree.nodes.length = 0;
					hit_stack.push(tree);
					count_stack.push(1);
				}
				else if (hit_stack.length > 0 && tree.nodes.length < this.minWidth) { // Underflow..AGAIN!
					ret_obj.nodes = this.searchSubtree(tree, true, ret_obj.nodes, tree);
					tree.nodes.length = 0;
				}
				else {
					delete ret_obj.nodes; // Just start resizing
				}
			}
			else { // we are just resizing
				this.MBR(tree.nodes, tree);
			}
			current_depth -= 1;
		} while (hit_stack.length > 0);

		return (ret_array);
	}

	chooseLeafSubtree(rect, root) {
		var best_choice_index = -1;
		var best_choice_stack = [];
		var best_choice_area;

		best_choice_stack.push(root);
		var nodes = root.nodes;

		do {
			if (best_choice_index != -1) {
				best_choice_stack.push(nodes[best_choice_index]);
				nodes = nodes[best_choice_index].nodes;
				best_choice_index = -1;
			}

			for (var i = nodes.length - 1; i >= 0; i--) {
				var ltree = nodes[i];
				if ("leaf" in ltree) {
					// Bail out of everything and start inserting
					best_choice_index = -1;
					break;
				}
				// Area of new enlarged rectangle
				var old_lratio = this.squarifiedRatio(ltree.w, ltree.h, ltree.nodes.length + 1);

				// Enlarge rectangle to fit new rectangle
				var nw = Math.max(ltree.x + ltree.w, rect.x + rect.w) - Math.min(ltree.x, rect.x);
				var nh = Math.max(ltree.y + ltree.h, rect.y + rect.h) - Math.min(ltree.y, rect.y);

				// Area of new enlarged rectangle
				var lratio = this.squarifiedRatio(nw, nh, ltree.nodes.length + 2);

				if (best_choice_index < 0 || Math.abs(lratio - old_lratio) < best_choice_area) {
					best_choice_area = Math.abs(lratio - old_lratio);
					best_choice_index = i;
				}
			}
		} while (best_choice_index != -1);

		return (best_choice_stack);
	}

	linearSplit(nodes) {
		var n = this.pickLinear(nodes);
		while (nodes.length > 0) {
			this.pickNext(nodes, n[0], n[1]);
		}
		return (n);
	}

	pickNext(nodes, a, b) {
		// Area of new enlarged rectangle
		var area_a = this.squarifiedRatio(a.w, a.h, a.nodes.length + 1);
		var area_b = this.squarifiedRatio(b.w, b.h, b.nodes.length + 1);
		var high_area_delta;
		var high_area_node;
		var lowest_growth_group;

		for (var i = nodes.length - 1; i >= 0; i--) {
			var l = nodes[i];
			var new_area_a = {};
			new_area_a.x = Math.min(a.x, l.x);
			new_area_a.y = Math.min(a.y, l.y);
			new_area_a.w = Math.max(a.x + a.w, l.x + l.w) - new_area_a.x;
			new_area_a.h = Math.max(a.y + a.h, l.y + l.h) - new_area_a.y;
			var change_new_area_a = Math.abs(this.squarifiedRatio(new_area_a.w, new_area_a.h, a.nodes.length + 2) - area_a);

			var new_area_b = {};
			new_area_b.x = Math.min(b.x, l.x);
			new_area_b.y = Math.min(b.y, l.y);
			new_area_b.w = Math.max(b.x + b.w, l.x + l.w) - new_area_b.x;
			new_area_b.h = Math.max(b.y + b.h, l.y + l.h) - new_area_b.y;
			var change_new_area_b = Math.abs(this.squarifiedRatio(new_area_b.w, new_area_b.h, b.nodes.length + 2) - area_b);

			if (!high_area_node || !high_area_delta || Math.abs(change_new_area_b - change_new_area_a) < high_area_delta) {
				high_area_node = i;
				high_area_delta = Math.abs(change_new_area_b - change_new_area_a);
				lowest_growth_group = change_new_area_b < change_new_area_a ? b : a;
			}
		}
		var temp_node = nodes.splice(high_area_node, 1)[0];
		if (a.nodes.length + nodes.length + 1 <= this.minWidth) {
			a.nodes.push(temp_node);
			this.expandRectangle(a, temp_node);
		}
		else if (b.nodes.length + nodes.length + 1 <= this.minWidth) {
			b.nodes.push(temp_node);
			this.expandRectangle(b, temp_node);
		}
		else {
			lowest_growth_group.nodes.push(temp_node);
			this.expandRectangle(lowest_growth_group, temp_node);
		}
	}

	pickLinear(nodes) {
		var lowest_high_x = nodes.length - 1;
		var highest_low_x = 0;
		var lowest_high_y = nodes.length - 1;
		var highest_low_y = 0;
		var t1, t2;

		for (var i = nodes.length - 2; i >= 0; i--) {
			var l = nodes[i];
			if (l.x > nodes[highest_low_x].x) {
				highest_low_x = i;
			}
			else if (l.x + l.w < nodes[lowest_high_x].x + nodes[lowest_high_x].w) lowest_high_x = i;
			if (l.y > nodes[highest_low_y].y) {
				highest_low_y = i;
			}
			else if (l.y + l.h < nodes[lowest_high_y].y + nodes[lowest_high_y].h) lowest_high_y = i;
		}
		var dx = Math.abs((nodes[lowest_high_x].x + nodes[lowest_high_x].w) - nodes[highest_low_x].x);
		var dy = Math.abs((nodes[lowest_high_y].y + nodes[lowest_high_y].h) - nodes[highest_low_y].y);
		if (dx > dy) {
			if (lowest_high_x > highest_low_x) {
				t1 = nodes.splice(lowest_high_x, 1)[0];
				t2 = nodes.splice(highest_low_x, 1)[0];
			}
			else {
				t2 = nodes.splice(highest_low_x, 1)[0];
				t1 = nodes.splice(lowest_high_x, 1)[0];
			}
		}
		else {
			if (lowest_high_y > highest_low_y) {
				t1 = nodes.splice(lowest_high_y, 1)[0];
				t2 = nodes.splice(highest_low_y, 1)[0];
			}
			else {
				t2 = nodes.splice(highest_low_y, 1)[0];
				t1 = nodes.splice(lowest_high_y, 1)[0];
			}
		}
		return ([{x: t1.x, y: t1.y, w: t1.w, h: t1.h, nodes: [t1]},
			{x: t2.x, y: t2.y, w: t2.w, h: t2.h, nodes: [t2]}]);
	}

	searchSubtree(rect, return_node, return_array, root) {
		var hit_stack = []; // Contains the elements that overlap

		if (!this.overlapRectangle(rect, root)) {
			return (return_array);
		}

		hit_stack.push(root.nodes);

		do {
			var nodes = hit_stack.pop();

			for (var i = nodes.length - 1; i >= 0; i--) {
				var ltree = nodes[i];
				if (this.overlapRectangle(rect, ltree)) {
					if ("nodes" in ltree) { // Not a Leaf
						hit_stack.push(ltree.nodes);
					}
					else if ("leaf" in ltree) { // A Leaf !!
						if (!return_node) {
							return_array.push(ltree.leaf);
						}
						else {
							return_array.push(ltree);
						}
					}
				}
			}
		} while (hit_stack.length > 0);

		return (return_array);
	}

	insertSubtree(node, root) {
		var bc; // Best Current node
		// Initial insertion is special because we resize the Tree and we don't
		// care about any overflow (seriously, how can the first object overflow?)
		if (root.nodes.length == 0) {
			root.x = node.x;
			root.y = node.y;
			root.w = node.w;
			root.h = node.h;
			root.nodes.push(node);
			return;
		}

		// Find the best fitting leaf node
		// choose_leaf returns an array of all tree levels (including root)
		// that were traversed while trying to find the leaf
		var tree_stack = this.chooseLeafSubtree(node, root);
		var ret_obj = node;//{x:rect.x,y:rect.y,w:rect.w,h:rect.h, leaf:obj};

		// Walk back up the tree resizing and inserting as needed
		do {
			//handle the case of an empty node (from a split)
			if (bc && "nodes" in bc && bc.nodes.length == 0) {
				var pbc = bc; // Past bc
				bc = tree_stack.pop();
				for (var t = 0; t < bc.nodes.length; t++) {
					if (bc.nodes[t] === pbc || bc.nodes[t].nodes.length == 0) {
						bc.nodes.splice(t, 1);
						break;
					}
				}
			}
			else {
				bc = tree_stack.pop();
			}

			// If there is data attached to this ret_obj
			if ("leaf" in ret_obj || "nodes" in ret_obj || this.isArray(ret_obj)) {
				// Do Insert
				if (this.isArray(ret_obj)) {
					for (var ai = 0; ai < ret_obj.length; ai++) {
						this.expandRectangle(bc, ret_obj[ai]);
					}
					bc.nodes = bc.nodes.concat(ret_obj);
				}
				else {
					this.expandRectangle(bc, ret_obj);
					bc.nodes.push(ret_obj); // Do Insert
				}

				if (bc.nodes.length <= this.maxWidth) { // Start Resizeing Up the Tree
					ret_obj = {x: bc.x, y: bc.y, w: bc.w, h: bc.h};
				}
				else { // Otherwise Split this Node
					// linear_split() returns an array containing two new nodes
					// formed from the split of the previous node's overflow
					var a = this.linearSplit(bc.nodes);
					ret_obj = a;//[1];

					if (tree_stack.length < 1) { // If are splitting the root..
						bc.nodes.push(a[0]);
						tree_stack.push(bc);     // Reconsider the root element
						ret_obj = a[1];
					}
					/*else {
					 delete bc;
					 }*/
				}
			}
			else { // Otherwise Do Resize
				//Just keep applying the new bounding rectangle to the parents..
				this.expandRectangle(bc, ret_obj);
				ret_obj = {x: bc.x, y: bc.y, w: bc.w, h: bc.h};
			}
		} while (tree_stack.length > 0);


	}

	search(rect, return_node, return_array) {
		if (arguments.length < 1) {
			throw "Wrong number of arguments. RT.Search requires at least a bounding rectangle."
		}

		switch (arguments.length) {
			case 1:
				arguments[1] = false;// Add an "return node" flag - may be removed in future
			case 2:
				arguments[2] = []; // Add an empty array to contain results
			case 3:
				arguments[3] = this._T; // Add root node to end of argument list
			default:
				arguments.length = 4;
		}
		return (this.searchSubtree.apply(this, arguments));
	}

	remove(rect, obj) {
		if (arguments.length < 1) {
			throw "Wrong number of arguments. RT.remove requires at least a bounding rectangle."
		}

		switch (arguments.length) {
			case 1:
				arguments[1] = false; // obj == false for conditionals
			case 2:
				arguments[2] = this._T; // Add root node to end of argument list
			default:
				arguments.length = 3;
		}
		if (arguments[1] === false) { // Do area-wide delete
			var numberdeleted = 0;
			var ret_array = [];
			do {
				numberdeleted = ret_array.length;
				ret_array = ret_array.concat(this.removeSubtree.apply(this, arguments));
			} while (numberdeleted != ret_array.length);
			return ret_array;
		}
		else { // Delete a specific item
			return (this.removeSubtree.apply(this, arguments));
		}
	}

	insert(rect, obj) {
		if (arguments.length < 2) {
			throw "Wrong number of arguments. RT.Insert requires at least a bounding rectangle and an object.";
		}

		return (this.insertSubtree({x: rect.x, y: rect.y, w: rect.w, h: rect.h, leaf: obj}, this._T));
	}
}

export default RTree;
